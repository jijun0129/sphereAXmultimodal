import os
import json
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image

import clip
from model import customCLIP
import numpy as np
from tqdm import tqdm

class DOCCIDataset(Dataset):
    def __init__(self, data_dir, transform=None):
        """
        DOCCI 데이터셋(https://google.github.io/docci/#downloads)을 위한 데이터셋 클래스
        Args:
            data_dir (str): DOCCI 데이터셋 경로
            transform: 이미지 전처리를 위한 transform
        """
        self.data_dir = data_dir
        self.transform = transform
        
        # 이미지와 레이블 파일 리스트 로드
        self.images = []
        self.labels = []
        
        # DOCCI 데이터셋 구조에 맞게 데이터 로드
        for img_name in os.listdir(os.path.join(data_dir, "images")):
            if img_name.endswith(".jpg") or img_name.endswith(".png"):
                img_path = os.path.join(data_dir, "images", img_name)
                label_path = os.path.join(data_dir, "labels", img_name.replace(".jpg", ".txt").replace(".png", ".txt"))
                
                if os.path.exists(label_path):
                    self.images.append(img_path)
                    with open(label_path, "r", encoding="utf-8") as f:
                        self.labels.append(f.read().strip())

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        # 이미지 로드 및 전처리
        image = Image.open(self.images[idx]).convert("RGB")
        if self.transform:
            image = self.transform(image)
            
        # 텍스트 레이블
        text = self.labels[idx]
        
        return image, text

def train():
    # device 설정
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # hyperparameter 설정
    batch_size = 32
    learning_rate = 1e-5
    num_epochs = 10
    
    # 데이터 전처리
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize((0.48145466, 0.4578275, 0.40821073), 
                           (0.26862954, 0.26130258, 0.27577711))
    ])
    
    # 데이터셋 및 데이터로더 초기화
    train_dataset = DOCCIDataset(
        data_dir="docci",
        transform=transform
    )
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=4
    )
    
    # 모델 초기화 부분 (수정가능, hyperparameter)
    embed_dim = 512  # CLIP ViT-B/16 기준 그대로 사용
    image_resolution = 224
    vision_layers = 12
    vision_width = 768
    vision_patch_size = 16
    context_length = 77
    vocab_size = 49408
    transformer_width = 512
    transformer_heads = 8
    transformer_layers = 12

    model = customCLIP(
        embed_dim=embed_dim,
        image_resolution=image_resolution,
        vision_layers=vision_layers,
        vision_width=vision_width,
        vision_patch_size=vision_patch_size,
        context_length=context_length,
        vocab_size=vocab_size,
        transformer_width=transformer_width,
        transformer_heads=transformer_heads,
        transformer_layers=transformer_layers
    ).to(device)

    model = model.float()  # fp32로 변환 (양자화 할거면 조절 하세요)
    
    # opmtimizer 설정
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    
    # loss function
    criterion = nn.CrossEntropyLoss()
    
    # train loop
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        
        with tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}") as pbar:
            for images, texts in pbar:
                images = images.to(device)
                
                # 텍스트 토큰화
                text_tokens = clip.tokenize(texts).to(device)
                
                # Forward pass
                image_features = model.encode_image(images)
                text_features = model.encode_text(text_tokens)
                
                # 특징 정규화
                image_features = image_features / image_features.norm(dim=1, keepdim=True)
                text_features = text_features / text_features.norm(dim=1, keepdim=True)
                
                # Logit 계산
                logit_scale = model.logit_scale.exp()
                logits_per_image = logit_scale * image_features @ text_features.t()
                logits_per_text = logits_per_image.t()
                
                # Ground truth: 대각 행렬 (각 이미지와 해당 텍스트와 매칭)
                ground_truth = torch.arange(len(images)).to(device)
                
                # 손실 계산 (양방향)
                loss_i = criterion(logits_per_image, ground_truth)
                loss_t = criterion(logits_per_text, ground_truth)
                loss = (loss_i + loss_t) / 2
                
                # Backward pass
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
                
                # 진행률 표시 업데이트
                pbar.set_postfix({"Loss": f"{loss.item():.4f}"})
        
        # 에폭당 평균 손실 출력
        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1} Average Loss: {avg_loss:.4f}")
        
        # 모델 저장
        if (epoch + 1) % 5 == 0:
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'loss': avg_loss,
            }, f'model_epoch_{epoch+1}.pth')

if __name__ == "__main__":
    train()