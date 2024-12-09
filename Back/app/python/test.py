import torch
from transformers import CLIPModel, CLIPProcessor
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import cv2

# CLIP 모델과 전처리기 로드
model_name = "openai/clip-vit-base-patch16"
model = CLIPModel.from_pretrained(model_name).eval()
processor = CLIPProcessor.from_pretrained(model_name)

# 이미지와 텍스트 준비
image_path = "docci/images/train_09148.jpg"  # 이미지 경로
text = "a cat"  # 분석할 텍스트
image = Image.open(image_path).convert("RGB")

# 이미지와 텍스트 전처리
inputs = processor(text=[text], images=image, return_tensors="pt", padding=True)

# 이미지 패치 임베딩 계산
with torch.no_grad():
    vision_outputs = model.vision_model(pixel_values=inputs["pixel_values"], output_attentions=False)
    patch_embeddings = vision_outputs.last_hidden_state[:, 1:, :]  # [CLS] 제외 패치 임베딩
    projection_weights = model.visual_projection.weight
    patch_embeddings_512 = torch.einsum('bnh,fh->bnf', patch_embeddings, projection_weights)  # 투영
    patch_embeddings_512 = patch_embeddings_512 / patch_embeddings_512.norm(dim=-1, keepdim=True)

# 텍스트 임베딩 계산
with torch.no_grad():
    text_embeddings = model.get_text_features(**inputs).squeeze(0)
    text_embeddings = text_embeddings / text_embeddings.norm(dim=-1, keepdim=True)

# 텍스트와 각 패치 간 코사인 유사도 계산
cosine_similarities = torch.matmul(patch_embeddings_512, text_embeddings.unsqueeze(-1)).squeeze(-1)
cosine_similarities = cosine_similarities.reshape(14, 14).cpu().numpy()  # 14x14 패치로 변환

# Thresholding 적용
threshold = 0.5  # 유사도 임계값
highlighted_map = np.where(cosine_similarities >= threshold, cosine_similarities, 0)  # 임계값 이상만 유지

# 강조된 영역 시각화
plt.imshow(highlighted_map, cmap="viridis")
plt.colorbar()
plt.title(f"Patches with Similarity >= {threshold} for '{text}'")
plt.show()
