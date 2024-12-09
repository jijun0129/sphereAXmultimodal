# Model의 상세 구조

#### ModifiedResNet ####################################################################################################################################

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from torch.nn.functional import normalize
from collections import OrderedDict

class Attention(nn.Module):
    def __init__(self, dim, num_heads=8, qkv_bias=False, qk_scale=None, attn_drop=0.0, proj_drop=0.0):
        super().__init__()
        
        self.num_heads = num_heads
        self.head_dim = dim // num_heads  # 각 head의 차원
        self.scale = qk_scale or self.head_dim ** -0.5 
        # Query, Key, Value를 생성하는 선형 변환
        self.in_proj_weight = nn.Parameter(torch.empty((dim * 3, dim)))  # Q, K, V를 위한 가중치
        
        # 출력 프로젝션
        self.out_proj = nn.Linear(dim, dim)
        
        # Dropout 레이어
        self.attn_drop = nn.Dropout(attn_drop)
        self.proj = nn.Linear(dim, dim)
        self.proj_drop = nn.Dropout(proj_drop)

    def forward(self, x):
        B, N, C = x.shape  # Batch, Sequence Length, Embedding Dimension
        
        # Q, K, V 생성 및 분리
        qkv = F.linear(x, self.in_proj_weight)
        qkv = qkv.reshape(B, N, 3, self.num_heads, C // self.num_heads).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        # Scaled Dot-Product Attention
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = F.softmax(attn, dim=-1)
        attn = self.attn_drop(attn)

        # Attention 가중치를 Value에 적용
        x = (attn @ v).transpose(1, 2).reshape(B, N, C)
        
        # 최종 선형 변환 및 Dropout
        x = self.out_proj(x)
        x = self.proj_drop(x)
        return x

    
    """
    Parameters:
        out_dim: output dimension
        dim: input dimension
        num_heads: number of attention heads (default=8)
        qkv_bias: enable bias in qkv projection(선형 연산)
        qk_scale: custom scale factor for attention
        attn_drop: attention dropout rate
        proj_drop: projection dropout rate
        settings: configuration settings

    Components:
        - Multi-head projection (qkv)
        - Attention dropout
        - Output projection
        - Projection dropout

    Forward Process:
        Input: tensor x [B, N, C]
        
        1. QKV Transformation:
            - Project input to qkv
            - Reshape to [B, N, 3, num_heads, C/num_heads]
            - Split into q, k, v

        2. Original Path Processing:
            - Calculate attention: (q @ k.T) * scale
            - Apply softmax
            - Apply dropout
            
        3. Modified Path Processing:
            - Replace k & q with v
            - If settings == 'resnet':
                * Normalize k
                * Use larger scale (scale * 8)
            - Calculate attention with modified q, k
            - Apply softmax and dropout

        4. Final Processing:
            - Process both paths (original and modified)
            - Reshape and project outputs
            - Apply dropout
            Return: [modified_output, original_output]
        

class AttentionPool2d(nn.Module):
    def __init__(self, spacial_dim, embed_dim, num_heads, output_dim=None):
        super().__init__()
        self.positional_embedding = nn.Parameter(torch.randn(spacial_dim ** 2 + 1, embed_dim) / embed_dim ** 0.5)
        self.attention = Attention(embed_dim, num_heads)
        self.output_proj = nn.Linear(embed_dim, output_dim) if output_dim else nn.Identity()

    def forward(self, x):
        B, C, H, W = x.shape
        x = x.reshape(B, C, H * W).permute(0, 2, 1)  # NCHW -> (HW)NC
        cls_token = torch.zeros(B, 1, C, device=x.device)
        x = torch.cat([cls_token, x], dim=1)
        x = x + self.positional_embedding[: x.shape[1], :].unsqueeze(0)

        x = self.attention(x)
        return self.output_proj(x[:, 0])  # Only cls token

    
    Parameters:
        spacial_dim: spatial dimension
        embed_dim: embedding dimension
        num_heads: number of attention heads
        output_dim: output dimension (optional)

    Components:
        - Positional embedding
        - Key projection
        - Query projection
        - Value projection
        - Output projection
        - Custom attention module (initialized during first forward)

    Forward Process:
        1. First Forward Pass Initialization:
            If attention not initialized:
                - Create new Attention module
                - Copy weights from v_proj to qkv
                - Copy weights from c_proj to output projection

        2. Input Processing:
            - Reshape input from NCHW to (HW)NC
            - Add mean token (cls token)

        3. Position Embedding Update:
            If input size != original size:
                - Interpolate position embeddings
                - Update embedding data
            Add position embeddings to input

        4. Attention Application:
            - Apply attention module
            - Get both modified and original outputs

        5. Final Processing:
            - Replace cls token from modified path with original
            Return: final output tensor
        

class Bottleneck(nn.Module):
    expansion = 4

    def __init__(self, inplanes, planes, stride=1, downsample=None):
        super().__init__()
        self.conv1 = nn.Conv2d(inplanes, planes, kernel_size=1, stride=1, bias=False)
        self.bn1 = nn.BatchNorm2d(planes)
        self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(planes)
        self.conv3 = nn.Conv2d(planes, planes * self.expansion, kernel_size=1, stride=1, bias=False)
        self.bn3 = nn.BatchNorm2d(planes * self.expansion)
        self.relu = nn.ReLU(inplace=True)
        self.downsample = downsample

    def forward(self, x):
        identity = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)
        out = self.relu(out)

        out = self.conv3(out)
        out = self.bn3(out)

        if self.downsample is not None:
            identity = self.downsample(x)

        out += identity
        out = self.relu(out)

        return out

    
    Constant:
        - expansion = 4 (multiplier for output channels)
    
    Input Parameters:
        - inplanes: input channels
        - planes: intermediate channels
        - stride: stride value (default=1)
    
    Output channels = planes * expansion

    ## Network Architecture

    1. Main Branch (3 Conv layers):
        First Conv Block (Dimension reduction):
            Input: inplanes channels
            Output: planes channels
            kernel: 1x1 conv, stride=1
            BatchNorm
            ReLU

        Second Conv Block (3x3 conv):
            Input: planes channels
            Output: planes channels
            kernel: 3x3 conv, stride=1, padding=1
            BatchNorm
            ReLU
            If stride > 1: Apply AvgPool2d(stride)
            Else: Identity()

        Third Conv Block (Dimension increase):
            Input: planes channels
            Output: planes * expansion channels
            kernel: 1x1 conv, stride=1
            BatchNorm
            
    2. Skip Connection (Downsample):
        If stride > 1 OR input_channels != output_channels:
            Sequential:
                1. AvgPool2d(stride)
                2. 1x1 conv, stride=1
                3. BatchNorm
        Else:
            Direct skip connection

    ## Forward Flow

    1. Save input as identity
    2. Main branch:
       - Pass through first conv-bn-relu
       - Pass through second conv-bn-relu
       - Apply avgpool if stride > 1
       - Pass through third conv-bn
    3. Skip connection:
       - If downsample exists, apply to identity
    4. Add main branch and identity
    5. Apply final ReLU
    6. Return result
"""
class ModifiedResNet(nn.Module):
    def __init__(self, layers, output_dim, heads, input_resolution, width=64):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(3, width // 2, kernel_size=3, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(width // 2),
            nn.ReLU(inplace=True),
            nn.Conv2d(width // 2, width // 2, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(width // 2),
            nn.ReLU(inplace=True),
            nn.Conv2d(width // 2, width, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(width),
            nn.ReLU(inplace=True),
            nn.AvgPool2d(kernel_size=2, stride=2)
        )

        self.inplanes = width
        self.layer1 = self._make_layer(Bottleneck, width, layers[0])
        self.layer2 = self._make_layer(Bottleneck, width * 2, layers[1], stride=2)
        self.layer3 = self._make_layer(Bottleneck, width * 4, layers[2], stride=2)
        self.layer4 = self._make_layer(Bottleneck, width * 8, layers[3], stride=2)

        embed_dim = width * 32
        self.attnpool = AttentionPool2d(input_resolution // 32, embed_dim, heads, output_dim)

    def _make_layer(self, block, planes, blocks, stride=1):
        downsample = None
        if stride != 1 or self.inplanes != planes * block.expansion:
            downsample = nn.Sequential(
                nn.Conv2d(self.inplanes, planes * block.expansion, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(planes * block.expansion),
            )

        layers = [block(self.inplanes, planes, stride, downsample)]
        self.inplanes = planes * block.expansion
        for _ in range(1, blocks):
            layers.append(block(self.inplanes, planes))

        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.stem(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.attnpool(x)
        return x

    """    
    Purpose: A modified ResNet that uses:
        - 3 stem convolutions instead of 1
        - Average pooling instead of max pooling
        - Anti-aliasing strided convolutions
        - QKV attention for final pooling instead of average pool

    Input parameters:
        - layers: list of integers defining number of blocks in each layer
        - output_dim: final output dimension
        - heads: number of attention heads
        - input_resolution: input image size (default 224)
        - width: base width of the network (default 64)

    ## Network Architecture

    1. Stem Layer (3 Conv layers):
        First: Conv Block:
            Input: 3 channels
            Output: width/2 channels
            kernel: 3x3 conv, stride: 2
            BatchNorm
            ReLU

        Second: Conv Block:
            Input: width/2 channels
            Output: width/2 channels
            kernel: 3x3 conv, stride: 1
            BatchNorm
            ReLU

        Third: Conv Block:
            Input: width/2 channels
            Output: width channels
            kernel: 3x3 conv, stride: 1
            BatchNorm
            ReLU

        Final: Average Pool with kernel size 2

    2. Residual Layers:
        layer1: (width, layers[0], stride=1)
        layer2: (width*2, layers[1], stride=2)
        layer3: (width*4, layers[2], stride=2)
        layer4: (width*8, layers[3], stride=2)
        ## layer Creation Function:
        Input Parameters:
            planes: target channel count for bottleneck
            blocks: number of bottleneck blocks
            stride: stride value (default=1)
        
        Creation Process:
            1. Create first bottleneck block:
               - Input: self._inplanes channels
               - Output: planes * 4 channels (due to Bottleneck expansion)
               - Uses specified stride
            
            2. Update self._inplanes to planes * 4
            
            3. Create remaining blocks in loop:
               - Input: planes * 4 channels
               - Output: planes * 4 channels
               - Always use stride=1
               - Add blocks-1 number of bottlenecks

        Each Layer contains multiple Bottleneck blocks as specified in 'layers' input parameter

    3. Attention Pooling(using AttentionPool2d):
        Input: Feature map of size (input_resolution/32)
        Embedding dimension: width*32
        Output: Final embedding of size output_dim

    ## Forward Flow

    1. Convert input to same dtype as first conv layer weights
    2. Pass through stem layers:
       - Three conv-bn-relu blocks
       - Average pooling
    3. Sequentially pass through residual layers 1-4
    4. Apply attention pooling
    5. Return output tensor (shape: Batch x N x Channels)
    """
#################################################################################################################################################

####VisionTransformer############################################################################################################################

class LayerNorm(nn.Module):
    def __init__(self, normalized_shape, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(normalized_shape))
        self.bias = nn.Parameter(torch.zeros(normalized_shape))
        self.eps = eps

    def forward(self, x):
        dtype = x.dtype
        mean = x.mean(-1, keepdim=True)
        var = x.var(-1, keepdim=True, unbiased=False)
        x = (x - mean) / torch.sqrt(var + self.eps)
        return x * self.weight + self.bias

    """
    Purpose: Handle fp16 data types in layer normalization
    
    Forward Process:
        Input: tensor x
        1. Save original data type
        2. Convert to float32 and apply layer norm
        3. Convert back to original type
        Return: normalized tensor
    """
class QuickGELU(nn.Module):
    def forward(self, x):
        return x * torch.sigmoid(1.702 * x)
    """
    Forward Process:
        Input: tensor x
        Compute: x * sigmoid(1.702 * x)
        Return: activated tensor
    """
class ResidualAttentionBlock(nn.Module):
    def __init__(self, d_model, n_head, attn_mask=None):
        super().__init__()
        self.attn = Attention(d_model, n_head)
        self.ln_1 = LayerNorm(d_model)
        self.mlp = nn.Sequential(OrderedDict([
            ("c_fc", nn.Linear(d_model, d_model * 4)),  # 첫 번째 Linear 레이어
            ("gelu", QuickGELU()),                              # 활성화 함수
            ("c_proj", nn.Linear(d_model * 4, d_model))  # 두 번째 Linear 레이어
        ]))
        self.ln_2 = LayerNorm(d_model)
        self.attn_mask = attn_mask

    def forward(self, x):
        # Attention with residual connection
        x = x + self.attn(self.ln_1(x))
        # MLP with residual connection
        x = x + self.mlp(self.ln_2(x))
        return x
    """
    Parameters:
        d_model: model dimension
        n_head: number of attention heads
        attn_mask: attention mask tensor (optional)
    
    Components:
        - Multihead Attention
        - LayerNorm (ln_1)
        - MLP:
            * Linear (d_model -> d_model*4)
            * QuickGELU
            * Linear (d_model*4 -> d_model)
        - LayerNorm (ln_2)
    
    Attention Process:
        Input: tensor x
        1. Convert mask to input dtype/device if exists
        2. If using custom Attention:
            - Transpose and process
            - Return [transformed_x, original_x]
        3. If using standard attention:
            - Return attention output
    
    Forward Process:
        1. For custom Attention (dual path):
            If input is list [x, x_ori]:
                - Apply attention to x_ori
                - Update both paths
                - Apply MLP only to x_ori
            If input is single tensor:
                - Start dual path
                - Split into two paths
                - Process similarly
        
        2. For standard Attention (single path):
            - Add attention output to input
            - Add MLP output to result
    """
class Transformer(nn.Module):
    def __init__(self, width, layers, heads, attn_mask=None):
        super().__init__()
        self.width = width  
        self.layers = layers
        self.resblocks = nn.ModuleList([
            ResidualAttentionBlock(width, heads, attn_mask) for _ in range(layers)
        ])

    def forward(self, x):
        for block in self.resblocks:
            x = block(x)
        return x

    """
    Parameters:
        width: model width
        layers: number of layers
        heads: number of attention heads
        attn_mask: optional mask
    
    Structure:
        Sequential stack of ResidualAttentionBlocks
        
    Forward Process:
        Pass input through sequence of blocks
    """
class VisionTransformer(nn.Module):
    def __init__(self, input_resolution, patch_size, width, layers, heads, output_dim):
        super().__init__()
        self.input_resolution = input_resolution
        self.conv1 = nn.Conv2d(3, width, kernel_size=patch_size, stride=patch_size, bias=False)
        self.class_embedding = nn.Parameter(torch.zeros(1, 1, width))
        self.positional_embedding = nn.Parameter(torch.zeros((input_resolution // patch_size) ** 2 + 1, width))
        self.ln_pre = LayerNorm(width)
        self.transformer = Transformer(width, layers, heads)
        self.ln_post = LayerNorm(width)
        self.proj = nn.Parameter(torch.empty(width, output_dim))

        nn.init.normal_(self.proj, std=width ** -0.5)

    def forward(self, x, return_all_patches=False):
        B, C, H, W = x.shape
        x = self.conv1(x)  # Convert image to patches
        x = x.flatten(2).transpose(1, 2)  # Reshape to (batch, num_patches, embedding_dim)
        cls_token = self.class_embedding.expand(B, -1, -1)  # Add class token
        x = torch.cat((cls_token, x), dim=1)
        x = x + self.positional_embedding.unsqueeze(0)
        x = self.ln_pre(x)

        x = self.transformer(x)
        
        if return_all_patches:
            return x @ self.proj  # Return all patches
        else:
            x = self.ln_post(x[:, 0, :])  # Extract CLS token
            x = x @ self.proj
            return x



    """
    Input Parameters:
        - input_resolution: input image size
        - patch_size: size of image patches
        - width: model width
        - layers: number of transformer layers
        - heads: number of attention heads
        - output_dim: output dimension
    
    ## Network Architecture

    1. Patch Embedding:
        - Conv2d(3, width, kernel=patch_size, stride=patch_size)
    
    2. Embeddings:
        - Class embedding: random initialized
        - Positional embedding: random initialized
    
    3. Transformers:
        - LayerNorm (pre)
        - Transformer blocks
        - LayerNorm (post)
        - Output projection
    
    ## Forward Flow

    1. First Inference Architecture:
        - Modify last 6 blocks
        - Copy weights to new attention
    2. Image Processing:
        - Convert to patches using conv1
        - Reshape to [batch, width, grid^2]
        - Permute to [batch, grid^2, width]
        - Add class token
    3. Position Embedding:
        - Check if input size matches original
        - Interpolate position embedding if needed
        - Add to image embeddings
    4. Transformer Processing:
        - Apply pre-layernorm
        - Permute to LND format
        - Pass through transformer
        - Copy original class token
        - Permute back to NLD
    5. Output:
        - Apply post-layernorm
        - Project to output dimension
    """
#################################################################################################################################################

### Main Model Class ############################################################################################################################

class customCLIP(nn.Module):
    """
    CLIP 모델을 수정하여 이미지-텍스트 매칭을 개선한 모델
    - 이중 경로 어텐션으로 지역적 특징과 전역적 특징을 모두 포착
    """
    def __init__(self, embed_dim, image_resolution, vision_layers, vision_width, vision_patch_size,
                 context_length, vocab_size, transformer_width, transformer_heads, transformer_layers):
        super().__init__()
        self.context_length = context_length 
        # 1. 비전 인코더 초기화
        if isinstance(vision_layers, (tuple, list)):
            # ResNet 기반 비전 인코더
            self.visual = ModifiedResNet(
                layers=vision_layers,
                output_dim=embed_dim,
                heads=vision_width * 32 // 64, 
                input_resolution=image_resolution,
                width=vision_width
            )
        else:
            # Vision Transformer 기반 비전 인코더
            self.visual = VisionTransformer(
                input_resolution=image_resolution,
                patch_size=vision_patch_size, # 이미지를 작은 조각(패치)로 나누고 이를 시퀀스 처럼
                width=vision_width,
                layers=vision_layers,
                heads=vision_width // 64, # vit에서 어탠션 하나의 차원 64
                output_dim=embed_dim
            )
            
        # 2. 텍스트 인코더 초기화
        self.transformer = Transformer(
            width=transformer_width,
            layers=transformer_layers,
            heads=transformer_heads,
            attn_mask=self.build_attention_mask()
        )
        
        # 3. 임베딩 레이어들 초기화
        self.token_embedding = nn.Embedding(vocab_size, transformer_width)
        self.positional_embedding = nn.Parameter(torch.empty(context_length, transformer_width))
        self.ln_final = LayerNorm(transformer_width)
        self.text_projection = nn.Parameter(torch.empty(transformer_width, embed_dim))
        self.logit_scale = nn.Parameter(torch.ones([]) * np.log(1 / 0.07))
        self.initialize_parameters()

    def initialize_parameters(self):
        """
        모델의 모든 파라미터를 초기화
        """
        # 텍스트 임베딩 초기화
        nn.init.normal_(self.token_embedding.weight, std=0.02)  # 토큰 임베딩 가중치
        nn.init.normal_(self.positional_embedding, std=0.01)    # 위치 임베딩 가중치

        # ResNet 기반 비전 모델일 경우의 초기화
        if isinstance(self.visual, ModifiedResNet):
            if self.visual.attnpool is not None:
                # 어텐션 풀링 레이어의 가중치 초기화
                std = self.visual.attnpool.c_proj.in_features ** -0.5  # 표준편차 계산
                # Q, K, V, C 프로젝션 레이어 가중치 초기화
                nn.init.normal_(self.visual.attnpool.q_proj.weight, std=std)
                nn.init.normal_(self.visual.attnpool.k_proj.weight, std=std)
                nn.init.normal_(self.visual.attnpool.v_proj.weight, std=std)
                nn.init.normal_(self.visual.attnpool.c_proj.weight, std=std)

            # ResNet 블록의 배치 정규화 가중치 초기화
            for resnet_block in [self.visual.layer1, self.visual.layer2, self.visual.layer3, self.visual.layer4]:
                for name, param in resnet_block.named_parameters():
                    if name.endswith("bn3.weight"):  # 마지막 배치 정규화 레이어
                        nn.init.zeros_(param)        # 0으로 초기화

        # 트랜스포머 관련 가중치 초기화
        # 각각의 표준편차 계산
        proj_std = (self.transformer.width ** -0.5) * ((2 * self.transformer.layers) ** -0.5)
        attn_std = self.transformer.width ** -0.5
        fc_std = (2 * self.transformer.width) ** -0.5
        
        # 각 트랜스포머 블록의 가중치 초기화
        for block in self.transformer.resblocks:
            nn.init.normal_(block.attn.in_proj_weight, std=attn_std)    # 어텐션 입력 프로젝션
            nn.init.normal_(block.attn.out_proj.weight, std=proj_std)   # 어텐션 출력 프로젝션
            nn.init.normal_(block.mlp.c_fc.weight, std=fc_std)          # MLP 첫 번째 레이어
            nn.init.normal_(block.mlp.c_proj.weight, std=proj_std)      # MLP 두 번째 레이어

        # 텍스트 프로젝션 레이어 초기화
        if self.text_projection is not None:
            nn.init.normal_(self.text_projection, std=self.transformer.width ** -0.5)

    def build_attention_mask(self):
        """
        어텐션 마스크 생성 (텍스트 처리용)
        - 현재 토큰은 이전 토큰들만 참조 가능
        """
        mask = torch.empty(self.context_length, self.context_length)
        mask.fill_(float("-inf"))    # 모든 값을 -inf로 채움
        mask.triu_(1)                # 상삼각 행렬만 남기고 나머지는 0으로 설정
        return mask

    @property
    def dtype(self):
        """
        모델의 데이터 타입을 반환 (float32 또는 float16)
        """
        return self.visual.conv1.weight.dtype

    def encode_image(self, image, return_all_patches=False):
        """
        이미지를 인코딩하여 특징 벡터로 변환
        """
        return self.visual(image.type(self.dtype),return_all_patches=return_all_patches)

    def encode_text(self, text):
        """
        텍스트를 인코딩하여 특징 벡터로 변환
        """
        # 텍스트 토큰을 임베딩으로 변환
        x = self.token_embedding(text).type(self.dtype)  # [batch_size, n_ctx, d_model]

        # 위치 정보 추가
        x = x + self.positional_embedding.type(self.dtype)
        
        # 차원 순서 변경: NLD -> LND (Length, Batch, Dimension)
        x = x.permute(1, 0, 2)
        
        # 트랜스포머 처리
        x = self.transformer(x)
        
        # 차원 순서 복원: LND -> NLD
        x = x.permute(1, 0, 2)
        
        # 최종 레이어 정규화
        x = self.ln_final(x).type(self.dtype)

        # EOT 토큰의 특징만 추출 (시퀀스의 마지막 토큰)
        x = x[torch.arange(x.shape[0]), text.argmax(dim=-1)] @ self.text_projection

        return x

    def forward(self, image, text, return_all_patches):
        """
        전체 모델의 forward
        """
        # 1. 특징 추출
        image_features = self.encode_image(image, return_all_patches=return_all_patches)
        text_features = self.encode_text(text)
        
        # 2. 특징 정규화
        image_features = normalize(image_features)
        text_features = normalize(text_features)
        
        # 3. 유사도 계산
        logit_scale = self.logit_scale.exp()
        logits_per_image = logit_scale * (image_features @ text_features.t())
        logits_per_text = logits_per_image.t()
        
        return logits_per_image, logits_per_text