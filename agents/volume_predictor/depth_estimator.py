import numpy as np
from PIL import Image
import os
import cv2
import torch
from typing import Union
from io import BytesIO
from .depth_anything_v2.dpt import DepthAnythingV2

class DepthEstimator:
    """
    Depth estimation using Depth Anything V2 model.
    """
    def __init__(self, model_path: str, model_type: str = 'vits'):
        """
        Initialize the Depth Anything model handler.
        """
        self.model_path = model_path
        self.model_type = model_type
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model_configs = {
            'vits': {'encoder': 'vits', 'features': 64, 'out_channels': [48, 96, 192, 384]},
            'vitb': {'encoder': 'vitb', 'features': 128, 'out_channels': [96, 192, 384, 768]},
            'vitl': {'encoder': 'vitl', 'features': 256, 'out_channels': [256, 512, 1024, 1024]}
        }
        self.dataset = 'hypersim' # 'hypersim' for indoor model, 'vkitti' for outdoor model
        self.max_depth = 20 # 20 for indoor model, 80 for outdoor model
        
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f'Model file not found: {self.model_path}')
            
            print(f'Loading Depth Anything V2 model from {self.model_path}, type={self.model_type}')
            self.model = DepthAnythingV2(**{**self.model_configs[self.model_type], 'max_depth': self.max_depth})
            self.model.load_state_dict(torch.load(self.model_path, map_location='cpu'))
            self.model.eval()
            print(f'Depth Anything model loaded successfully')
            
        except Exception as e:
            print(f'Failed to load Depth Anything model: {str(e)}')
            raise ValueError(f'Failed to load Depth Anything model: {str(e)}')
    
    def predict(self, image_bytes: Union[bytes, np.ndarray]) -> np.ndarray:
        """
        Run depth estimation on an image and return a metric depth map (meter).
        """
        if isinstance(image_bytes, bytes):
            pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')
            rgb_img = np.array(pil_image)
            bgr_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)
        else:
            bgr_img = image_bytes
        
        with torch.no_grad():
            depth_map = self.model.infer_image(bgr_img)
        return depth_map