import torch
import cv2
import numpy as np
from PIL import Image
from transformers import CLIPModel, CLIPProcessor
from torchvision.transforms import Compose, Resize, ToTensor, Normalize
from torchvision.transforms import InterpolationMode
import os
import clip  # 추가
from model import customCLIP  # 필요하면 유지
from simple_tokenizer import SimpleTokenizer as _Tokenizer  # 필요하면 유지
from typing import List
import json
import sys

class InferenceService:
    def __init__(self, model_name="openai/clip-vit-base-patch16", device="cuda" if torch.cuda.is_available() else "cpu"):
        self.device = device
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.model.eval()

        self.processor = CLIPProcessor.from_pretrained(model_name)

        self.preprocess = Compose([
            Resize((224, 224), interpolation=InterpolationMode.BICUBIC),
            ToTensor(),
            Normalize((0.48145466, 0.4578275, 0.40821073),
                     (0.26862954, 0.26130258, 0.27577711))
        ])

    def encode_text_with_prompt_ensemble(self, texts: List[str], prompt_templates=None):
        if prompt_templates is None:
            prompt_templates = [
                'a photo of a {}.', 'a bad photo of a {}.', 'a sculpture of a {}.',
                'a photo of the hard to see {}.', 'a low resolution photo of the {}.',
                'a rendering of a {}.', 'graffiti of a {}.', 'a drawing of a {}.'
            ]

        text_features = []
        for text in texts:
            prompted_texts = [template.format(text) for template in prompt_templates]
            inputs = self.processor(text=prompted_texts, return_tensors="pt", padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                embeddings = self.model.get_text_features(**inputs)
                embeddings = embeddings / embeddings.norm(dim=-1, keepdim=True)

                mean_embedding = embeddings.mean(dim=0)
                mean_embedding = mean_embedding / mean_embedding.norm()
                text_features.append(mean_embedding)

        return torch.stack(text_features, dim=0)

    def process_image(self, image_path: str, target_texts: List[str]):
        try:
            pil_img = Image.open(image_path).convert('RGB')
            cv2_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            image = self.preprocess(pil_img).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model.vision_model(pixel_values=image)
                patch_embeddings = outputs.last_hidden_state[:, 1:, :]

                projection_weights = self.model.visual_projection.weight
                patch_embeddings_512 = torch.einsum('bnh,fh->bnf', patch_embeddings, projection_weights)
                patch_embeddings_512 = patch_embeddings_512 / patch_embeddings_512.norm(dim=-1, keepdim=True)

                text_features = self.encode_text_with_prompt_ensemble(target_texts)

                features = patch_embeddings_512 @ text_features.t()

                similarity_map = clip.get_similarity_map(features, cv2_img.shape[:2])  # clip 함수 호출

                # 저장 및 시각화
                results = []
                for n, text in enumerate(target_texts):
                    vis = (similarity_map[0, :, :, n].cpu().numpy() * 255).astype('uint8')

                    # 2. 알파값 계산 (유사도 기반으로 점진적 변화)
                    percentile_value = int(np.percentile(vis, 45))
                    margin = 50  # 경계를 부드럽게 처리할 범위
                    alpha = np.clip((vis - (percentile_value - margin)) / (2 * margin), 0, 1)  # 점진적 변화
                    alpha = np.power(alpha, 2)  # 비선형 조정으로 부드러움 강화
                    alpha_blur = cv2.GaussianBlur(alpha, (31, 31), 0) 
                    alpha = np.expand_dims(alpha_blur, axis=-1)  # (H, W) → (H, W, 1)
                    alpha = np.repeat(alpha, 3, axis=-1)    # (H, W, 1) → (H, W, 3)

                    # 3. 강한 흐림 처리 (아예 안 보이도록)
                    blurred_img = cv2.GaussianBlur(cv2_img, (101, 101), 0)  # 강한 흐림 효과
                    almost_white_background = cv2.addWeighted(blurred_img, 0.3, np.ones_like(cv2_img) * 255, 0.7, 0)  # 뿌연 흰색

                    # 4. 알파 블렌딩: 완전 뿌옇게 처리
                    blended_vis = (cv2_img * alpha + almost_white_background * (1 - alpha)).astype('uint8')

                    # 5. 시각화
                    #blended_vis = cv2.cvtColor(blended_vis.astype('uint8'), cv2.COLOR_BGR2RGB)  # BGR → RGB 변환

                    output_filename = f"{os.path.splitext(os.path.basename(image_path))[0]}_{text}_result.jpg"
                    output_path = os.path.join(
                        os.path.dirname(image_path).replace('original', 'results'),
                        output_filename
                    )
                    cv2.imwrite(output_path, blended_vis)

                    results.append({
                        'text': target_texts[n],
                        'output_path': output_path,
                        'similarity_score': float(features[0, :, n].max().item())
                    })

                return {
                    'status': 'success',
                    'results': results
                }

        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

def main():
    if len(sys.argv) < 3:
        print(json.dumps({'status': 'error', 'error': 'Invalid arguments'}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    target_texts = sys.argv[2].split(',')  
    
    service = InferenceService()
    result = service.process_image(image_path, target_texts)
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()