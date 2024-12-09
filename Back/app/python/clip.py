#라이브러리 임포트 및 초기 설정
import hashlib  # 파일 무결성을 확인하기 위해 SHA256 해시를 계산하는 모듈
import os  # 파일 경로 및 디렉토리 작업을 위한 모듈
import urllib  # URL에서 파일 다운로드를 지원하는 모듈
import warnings  # 경고 메시지 출력
from typing import Union, List  # 타입 힌트 제공
from pkg_resources import packaging  # 패키지 버전 비교

import torch  # PyTorch 딥러닝 프레임워크
from PIL import Image  # 이미지 작업을 위한 Python Imaging Library
from torchvision.transforms import Compose, Resize, ToTensor, Normalize  # 이미지 변환 도구
from tqdm import tqdm  # 다운로드 상태 표시를 위한 진행률 표시기
import numpy as np  # 수학 연산을 위한 라이브러리

# from .build_model import build_model  # CLIP 모델을 생성하는 함수
from simple_tokenizer import SimpleTokenizer as _Tokenizer  # 간단한 텍스트 토크나이저

# torchvision 버전이 지원되면 InterpolationMode 가져오기
try:
    from torchvision.transforms import InterpolationMode
    BICUBIC = InterpolationMode.BICUBIC  # BICUBIC 보간법 정의
except ImportError:  # 호환되지 않으면 PIL BICUBIC 사용
    BICUBIC = Image.BICUBIC

# PyTorch 버전 확인
if packaging.version.parse(torch.__version__) < packaging.version.parse("1.7.1"):
    warnings.warn("PyTorch version 1.7.1 or higher is recommended")  # 권장 버전 경고

# 외부로 노출할 함수 및 클래스 정의
__all__ = ["available_models", "load", "tokenize", "encode_text_with_prompt_ensemble",
           "get_similarity_map", "feature_map", "similarity_map"]

# 간단한 토크나이저 인스턴스 생성
_tokenizer = _Tokenizer()

# CLIP 모델 이름과 다운로드 URL 매핑
_MODELS = {
    "RN50": "https://openaipublic.azureedge.net/clip/models/afeb0e10f9e5a86da6080e35cf09123aca3b358a0c3e3b6c78a7b63bc04b6762/RN50.pt",
    "RN101": "https://openaipublic.azureedge.net/clip/models/8fa8567bab74a42d41c5915025a8e4538c3bdbe8804a470a72f30b0d94fab599/RN101.pt",
    "RN50x4": "https://openaipublic.azureedge.net/clip/models/7e526bd135e493cef0776de27d5f42653e6b4c8bf9e0f653bb11773263205fdd/RN50x4.pt",
    "RN50x16": "https://openaipublic.azureedge.net/clip/models/52378b407f34354e150460fe41077663dd5b39c54cd0bfd2b27167a4a06ec9aa/RN50x16.pt",
    "RN50x64": "https://openaipublic.azureedge.net/clip/models/be1cfb55d75a9666199fb2206c106743da0f6468c9d327f3e0d0a543a9919d9c/RN50x64.pt",
    "ViT-B/32": "https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt",
    "ViT-B/16": "https://openaipublic.azureedge.net/clip/models/5806e77cd80f8b59890b7e101eabd078d9fb84e6937f9e85e4ecb61988df416f/ViT-B-16.pt",
    "ViT-L/14": "https://openaipublic.azureedge.net/clip/models/b8cca3fd41ae0c99ba7e8951adf17d267cdb84cd88be6f7c2e0eca1737a03836/ViT-L-14.pt",
    "ViT-L/14@336px": "https://openaipublic.azureedge.net/clip/models/3035c92b350959924f9f00213499208652fc7ea050643e8b385c2dac08641f02/ViT-L-14-336px.pt",
}

#파일 다운로드 및 검증 함수
def _download(url: str, root: str):
    os.makedirs(root, exist_ok=True)  # root 디렉토리를 생성 (이미 존재하면 무시)
    filename = os.path.basename(url)  # URL에서 파일 이름 추출

    expected_sha256 = url.split("/")[-2]  # URL 경로에서 SHA256 해시값 추출
    download_target = os.path.join(root, filename)  # 다운로드 파일의 저장 경로 설정

    # 파일이 이미 존재하는 경우
    if os.path.exists(download_target) and not os.path.isfile(download_target):
        raise RuntimeError(f"{download_target} exists and is not a regular file")  # 예외 발생

    if os.path.isfile(download_target):  # 파일이 이미 존재하면
        # SHA256 해시값 확인
        if hashlib.sha256(open(download_target, "rb").read()).hexdigest() == expected_sha256:
            return download_target  # 해시값이 일치하면 다운로드 생략
        else:
            warnings.warn(f"{download_target} exists, but the SHA256 checksum does not match; re-downloading the file")

    # URL에서 파일 다운로드
    with urllib.request.urlopen(url) as source, open(download_target, "wb") as output:
        with tqdm(total=int(source.info().get("Content-Length")), ncols=80, unit='iB', unit_scale=True, unit_divisor=1024) as loop:
            while True:
                buffer = source.read(8192)  # 데이터를 8192 바이트씩 읽기
                if not buffer:
                    break  # 데이터가 더 이상 없으면 중단
                output.write(buffer)  # 읽은 데이터를 파일에 기록
                loop.update(len(buffer))  # 진행 상태 업데이트

    # 다운로드한 파일의 SHA256 해시값 확인
    if hashlib.sha256(open(download_target, "rb").read()).hexdigest() != expected_sha256:
        raise RuntimeError(f"Model has been downloaded but the SHA256 checksum does not match")

    return download_target  # 다운로드된 파일의 경로 반환

# 이미지 변환 함수
def _convert_image_to_rgb(image):
    return image.convert("RGB")  # 이미지를 RGB 형식으로 변환

def _transform(n_px):
    return Compose([
        Resize((n_px, n_px), interpolation=BICUBIC),  # 이미지를 n_px 크기로 조정
        _convert_image_to_rgb,  # 이미지를 RGB로 변환
        ToTensor(),  # 이미지를 PyTorch 텐서로 변환
        Normalize((0.48145466, 0.4578275, 0.40821073),  # 평균값으로 정규화
                 (0.26862954, 0.26130258, 0.27577711)),  # 표준편차로 정규화
    ])

#사용 가능한 모델 확인 함수
def available_models() -> List[str]:
    """사용 가능한 CLIP 모델 이름을 반환"""
    return list(_MODELS.keys())  # _MODELS의 키 목록 반환

#모델 로드 함수
def load(name: str, device: Union[str, torch.device] = "cuda" if torch.cuda.is_available() else "cpu", 
         jit: bool = False, download_root: str = None):
    """CLIP 모델을 로드하는 함수"""
    if name in _MODELS:  # 모델 이름이 사전 정의된 모델에 있는 경우
        model_path = _download(_MODELS[name], download_root or os.path.expanduser("~/.cache/clip"))
    elif os.path.isfile(name):  # 로컬 경로로 모델을 지정한 경우
        model_path = name
    else:  # 모델 이름이 잘못된 경우 예외 처리
        raise RuntimeError(f"Model {name} not found; available models = {available_models()}")

    with open(model_path, 'rb') as opened_file:
        try:
            # JIT 모델 로드
            model = torch.jit.load(opened_file, map_location=device if jit else "cpu").eval()
            state_dict = None
        except RuntimeError:
            # state_dict 로드
            if jit:
                warnings.warn(f"File {model_path} is not a JIT archive. Loading as a state dict instead")
                jit = False
            state_dict = torch.load(opened_file, map_location="cpu")

    if not jit:  # JIT 모델이 아닌 경우 일반적으로 모델 로드
        model = build_model(name, state_dict or model.state_dict()).to(device)
        if str(device) == "cpu":  # CPU일 경우 정밀도를 float로 설정
            model.float()
        return model, _transform(model.visual.input_resolution)

    # JIT 모델 로드 후 장치 설정
    device_holder = torch.jit.trace(lambda: torch.ones([]).to(torch.device(device)), example_inputs=[])
    device_node = [n for n in device_holder.graph.findAllNodes("prim::Constant") if "Device" in repr(n)][-1]

    def patch_device(module):  # 장치 설정을 패치하는 내부 함수
        try:
            graphs = [module.graph] if hasattr(module, "graph") else []
        except RuntimeError:
            graphs = []

        if hasattr(module, "forward1"):
            graphs.append(module.forward1.graph)

        for graph in graphs:
            for node in graph.findAllNodes("prim::Constant"):
                if "value" in node.attributeNames() and str(node["value"]).startswith("cuda"):
                    node.copyAttributes(device_node)

    model.apply(patch_device)
    patch_device(model.encode_image)
    patch_device(model.encode_text)

    if str(device) == "cpu":  # CPU의 경우 dtype을 float32로 패치
        float_holder = torch.jit.trace(lambda: torch.ones([]).float(), example_inputs=[])
        float_input = list(float_holder.graph.findNode("aten::to").inputs())[1]
        float_node = float_input.node()

        def patch_float(module):  # dtype 패치 함수
            try:
                graphs = [module.graph] if hasattr(module, "graph") else []
            except RuntimeError:
                graphs = []

            if hasattr(module, "forward1"):
                graphs.append(module.forward1.graph)

            for graph in graphs:
                for node in graph.findAllNodes("aten::to"):
                    inputs = list(node.inputs())
                    for i in [1, 2]:  # dtype은 두 번째 또는 세 번째 인자로 전달됨
                        if inputs[i].node()["value"] == 5:
                            inputs[i].node().copyAttributes(float_node)

        model.apply(patch_float)
        patch_float(model.encode_image)
        patch_float(model.encode_text)

        model.float()

    return model, _transform(model.input_resolution.item())

#텍스트 토크나이즈 함수
def tokenize(texts: Union[str, List[str]], context_length: int = 77, truncate: bool = True):
    """
    입력 텍스트를 토크나이즈하여 2D 텐서로 변환.
    """
    if isinstance(texts, str):  # 단일 텍스트 입력 처리
        texts = [texts]

    sot_token = _tokenizer.encoder["<|startoftext|>"]  # 시작 토큰
    eot_token = _tokenizer.encoder["<|endoftext|>"]  # 종료 토큰
    all_tokens = [[sot_token] + _tokenizer.encode(text) + [eot_token] for text in texts]  # 각 텍스트 토큰화
    if packaging.version.parse(torch.__version__) < packaging.version.parse("1.8.0"):
        result = torch.zeros(len(all_tokens), context_length, dtype=torch.long)  # 오래된 버전의 경우
    else:
        result = torch.zeros(len(all_tokens), context_length, dtype=torch.int)  # 최신 버전의 경우

    for i, tokens in enumerate(all_tokens):  # 각 텍스트 토큰 처리
        if len(tokens) > context_length:  # 텍스트가 컨텍스트 길이를 초과할 경우
            if truncate:  # 잘라낼지 확인
                tokens = tokens[:context_length]
                tokens[-1] = eot_token  # 종료 토큰 추가
            else:
                raise RuntimeError(f"Input {texts[i]} is too long for context length {context_length}")
        result[i, :len(tokens)] = torch.tensor(tokens)  # 결과 텐서에 토큰 추가

    return result

#텍스트 임베딩 함수
def encode_text_with_prompt_ensemble(model, texts, device, prompt_templates=None):
    """
    프롬프트 템플릿을 사용하여 텍스트를 임베딩하는 함수
    """
    # 기본 ImageNet 프롬프트 템플릿 정의
    if prompt_templates is None:
        prompt_templates = [
            'a photo of a {}.', 'a bad photo of a {}.', 'a sculpture of a {}.', 
            'a photo of the hard to see {}.', 'a low resolution photo of the {}.', 
            'a rendering of a {}.', 'graffiti of a {}.', 'a drawing of a {}.'
        ]

    text_features = []  # 각 텍스트의 임베딩을 저장할 리스트
    for t in texts:  # 입력 텍스트 목록 반복
        prompted_t = [template.format(t) for template in prompt_templates]  
        # 각 텍스트에 대해 모든 프롬프트 템플릿 적용

        prompted_t = tokenize(prompted_t).to(device)  # 텍스트를 토크나이즈하고 GPU 또는 CPU로 이동
        class_embeddings = model.encode_text(prompted_t)  # 모델을 사용하여 텍스트 임베딩 생성
        class_embeddings /= class_embeddings.norm(dim=-1, keepdim=True)  # 임베딩을 정규화
        class_embedding = class_embeddings.mean(dim=0)  # 모든 템플릿의 임베딩 평균 계산
        class_embedding /= class_embedding.norm()  # 평균 임베딩을 정규화
        text_features.append(class_embedding)  # 결과를 저장
    text_features = torch.stack(text_features, dim=1).to(device).t()  
    # 모든 텍스트 임베딩을 하나의 텐서로 결합하고 전치

    return text_features  # 계산된 텍스트 특징 벡터 반환


#유사도 맵 변환 함수
def get_similarity_map(sm, shape):
    """
    유사도 맵을 입력 이미지의 크기에 맞게 변환.
    """
    sm = (sm - sm.min(1, keepdim=True)[0]) / (sm.max(1, keepdim=True)[0] - sm.min(1, keepdim=True)[0])
    # 유사도 맵의 각 값들을 0~1로 정규화

    side = int(sm.shape[1] ** 0.5)  # 유사도 맵을 정사각형으로 변환하기 위한 한 변의 길이 계산
    sm = sm.reshape(sm.shape[0], side, side, -1).permute(0, 3, 1, 2)
    # 유사도 맵을 4차원 텐서로 변환 (배치 크기, 채널, 높이, 너비)

    sm = torch.nn.functional.interpolate(sm, shape, mode='bilinear')  
    # 입력 이미지의 크기로 보간 (Bilinear Interpolation 사용)
    sm = sm.permute(0, 2, 3, 1)  # 채널 순서를 변환 (배치 크기, 높이, 너비, 채널)

    return sm  # 변환된 유사도 맵 반환

#특징 벡터로 유사도 맵 계산 함수
def feature_map(image_features, text_features, redundant_feats=None, t=2):
    """
    이미지와 텍스트의 특징 벡터를 기반으로 유사도 맵 생성
    """
    if redundant_feats is not None:  # 중복 특징 벡터가 주어진 경우
        similarity = image_features @ (text_features - redundant_feats).t()
        # 중복 특징을 제거한 텍스트 특징과 이미지 특징 간의 내적 계산
    else:  # 중복 특징이 없는 경우
        prob = image_features[:, :1, :] @ text_features.t()
        # 이미지 특징과 텍스트 특징 간의 내적 계산 (확률 분포 생성)
        prob = (prob * 2).softmax(-1)  # 확률 값을 Softmax를 통해 정규화

        w = prob / prob.mean(-1, keepdim=True)  # 각 클래스에 대한 가중치 계산

        # 텍스트와 이미지 특징의 모든 조합에 대해 곱셈 수행
        b, n_t, n_i, c = image_features.shape[0], text_features.shape[0], image_features.shape[1], image_features.shape[2]
        feats = image_features.reshape(b, n_i, 1, c) * text_features.reshape(1, 1, n_t, c)
        feats *= w.reshape(1, 1, n_t, 1)  # 가중치 적용
        redundant_feats = feats.mean(2, keepdim=True)  # 중복 특징 계산 (클래스 축으로 평균)
        feats = feats - redundant_feats  # 중복 특징 제거
        
        similarity = feats.sum(-1)  # 유사도 계산 (채널 축으로 합산)

    return similarity  # 계산된 유사도 반환


#유사도 맵 생성 및 샘플링 함수
def similarity_map(sm, shape, t=0.8, down_sample=2):
    """
    유사도 맵을 생성하고 입력 이미지 크기에 맞게 매핑
    """
    side = int(sm.shape[0] ** 0.5)  # 유사도 맵을 정사각형으로 변환하기 위한 한 변의 길이
    sm = sm.reshape(1, 1, side, side)  # 유사도 맵을 4차원 텐서로 변환
    down_side = side // down_sample  # 다운샘플링 크기 계산
    sm = torch.nn.functional.interpolate(sm, (down_side, down_side), mode='bilinear')[0, 0, :, :]
    # 다운샘플링을 통해 결과를 부드럽게 변환

    h, w = sm.shape  # 유사도 맵의 높이와 너비
    sm = sm.reshape(-1)  # 1차원으로 평탄화

    sm = (sm - sm.min()) / (sm.max() - sm.min())  # 유사도 값을 0~1로 정규화
    rank = sm.sort(0)[1]  # 유사도 값의 순위를 계산

    scale_h = float(shape[0]) / h  # 원래 이미지의 높이로 매핑하기 위한 비율
    scale_w = float(shape[1]) / w  # 원래 이미지의 너비로 매핑하기 위한 비율

    num = min((sm >= t).sum(), sm.shape[0] // 2)  # 임계값 이상의 점 계산
    labels = np.ones(num * 2).astype('uint8')  # 라벨 생성 (양수 및 음수 점)
    labels[num:] = 0  # 절반은 음수, 절반은 양수로 설정
    points = []  # 결과 점의 좌표를 저장할 리스트

    # 긍정 점(positive points) 좌표 계산
    for idx in rank[-num:]:
        x = min((idx % w + 0.5) * scale_w, shape[1] - 1)  # x 좌표 계산
        y = min((idx // w + 0.5) * scale_h, shape[0] - 1)  # y 좌표 계산
        points.append([int(x.item()), int(y.item())])

    # 부정 점(negative points) 좌표 계산
    for idx in rank[:num]:
        x = min((idx % w + 0.5) * scale_w, shape[1] - 1)
        y = min((idx // w + 0.5) * scale_h, shape[0] - 1)
        points.append([int(x.item()), int(y.item())])

    return points, labels  # 결과 좌표와 라벨 반환

