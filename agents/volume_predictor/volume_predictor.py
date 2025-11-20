import numpy as np
from PIL import Image
import cv2
import time
from .yolov8 import YOLOv8Seg
from .depth_estimator import DepthEstimator
from .point_cloud_generator import PointCloudGenerator
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from utils.mlflow_client import MLFlow
import os

class VolumePredictor:
    def __init__(
        self,
        yolo_path: str,
        dav2_path: str,
        dav2_type: str,
        focal_length_x = 470.4, 
        focal_length_y = 470.4, 
        conf = 0.25,
        iou = 0.7
    ):
        self.mlflow_client = MLFlow()
        self.mlflow_client.load_onnx_model(yolo_path, os.environ.get("YOLO_MLFLOW_URI"))
        self.mlflow_client.load_torch_model(dav2_path, os.environ.get("DAMv2_MLFLOW_URI"))

        self.depth_estimator = DepthEstimator(dav2_path, model_type=dav2_type)
        self.pc_generator = PointCloudGenerator(focal_length_x, focal_length_y)
        self.yolo = YOLOv8Seg(yolo_path, conf_thres=conf, iou_thres=iou)
        self.conf = conf
        self.iou = iou
        
    def predict(self, img_path: str):
        start = time.perf_counter()

        rgb_image = Image.open(img_path).convert("RGB")
        width, height = rgb_image.size
        rgb_image = np.array(rgb_image)

        dav2_start = time.perf_counter()
        depth_map = self.depth_estimator.predict(rgb_image)
        print(f"Depth Anything Model v2 Inference time: {(time.perf_counter() - dav2_start)*1000:.2f} ms")
        depth_map = np.array(Image.fromarray(depth_map).resize((width, height), Image.NEAREST))
        print("Depth map has been created")
        
        _, _, _, masks = self.yolo(rgb_image)
        print("Segmentation masks has been created")
        fixed_masks = []
        for m in masks:
            m_resized = cv2.resize(
                m.astype(np.uint8), 
                (width, height), interpolation=cv2.INTER_NEAREST)
            fixed_masks.append(m_resized)
        masks = np.array(fixed_masks)
        
        result = self.pc_generator.calculate_volumes_from_masks(
            width, height, depth_map, masks
        )
        print(f"Pipeline Inference time: {(time.perf_counter() - start)*1000:.2f} ms")
        return result

