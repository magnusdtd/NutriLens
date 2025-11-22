import numpy as np
from PIL import Image
import cv2
import time
from .yolov8 import YOLOv8Seg
from .yolov8.density_map import density_map
from .depth_estimator import DepthEstimator
from .point_cloud_generator import PointCloudGenerator
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
import os
from dataclasses import dataclass
from .yolov8.utils import class_names
from typing import List
from io import BytesIO
from huggingface_hub import hf_hub_download


@dataclass
class Prediction:
    object_name: str
    volume: float
    box: List
    score: float
    mask: np.ndarray
    weight: float
    density: float


class VolumePredictor():
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

        # Download YOLO model (ONNX)
        yolo_repo = "magnusdtd/yolov8-foodseg103"
        yolo_filename = "yolov8_foodseg103.onnx"
        yolo_model_local_path = hf_hub_download(
            repo_id=yolo_repo,
            filename=yolo_filename,
            cache_dir=os.path.dirname(yolo_path)
        )

        # Download Depth Anything v2 model (torch)
        dav2_repo = "depth-anything/Depth-Anything-V2-Metric-Hypersim-Small"
        dav2_filename = "depth_anything_v2_metric_hypersim_vits.pth"
        dav2_model_local_path = hf_hub_download(
            repo_id=dav2_repo,
            filename=dav2_filename,
            cache_dir=os.path.dirname(dav2_path)
        )
        # Assign the downloaded paths to instance variables for use by estimators
        self.yolo_path = yolo_model_local_path
        self.dav2_path = dav2_model_local_path

        self.depth_estimator = DepthEstimator(dav2_path, model_type=dav2_type)
        self.pc_generator = PointCloudGenerator(focal_length_x, focal_length_y)
        self.yolo = YOLOv8Seg(yolo_path, conf_thres=conf, iou_thres=iou)
        self.conf = conf
        self.iou = iou
        
    def predict(self, img: [str, bytes, Image.Image]) -> List[Prediction]:
        start = time.perf_counter()

        if isinstance(img, str):
            rgb_image = Image.open(img).convert("RGB")
        elif isinstance(img, (bytes, bytearray)):
            rgb_image = Image.open(BytesIO(img)).convert("RGB")
        elif isinstance(img, Image.Image):
            rgb_image = img.convert("RGB")
        else:
            raise ValueError("Input img must be a file path (str), bytes, or a PIL.Image.Image.")

        width, height = rgb_image.size
        rgb_image = np.array(rgb_image)

        dav2_start = time.perf_counter()
        depth_map = self.depth_estimator.predict(rgb_image)
        print(f"Depth Anything Model v2 Inference time: {(time.perf_counter() - dav2_start)*1000:.2f} ms")
        depth_map = np.array(Image.fromarray(depth_map).resize((width, height), Image.NEAREST))
        print("Depth map has been created")
        
        boxes, scores, class_ids, masks = self.yolo(rgb_image)
        print("Segmentation masks has been created")
        fixed_masks = []
        for m in masks:
            m_resized = cv2.resize(
                m.astype(np.uint8), 
                (width, height), interpolation=cv2.INTER_NEAREST)
            fixed_masks.append(m_resized)
        masks = np.array(fixed_masks)
        
        volumes = self.pc_generator.calculate_volumes_from_masks(
            width, height, depth_map, masks
        )

        predictions = []
        num_preds = min(len(boxes), len(volumes), len(scores), len(class_ids), len(masks))
        for i in range(num_preds):
            prediction = Prediction(
                object_name=class_names[class_ids[i]] if class_ids[i] < len(class_names) else str(class_ids[i]),
                volume=volumes[i],
                box=boxes[i].tolist() if hasattr(boxes[i], "tolist") else list(boxes[i]),
                score=float(scores[i]),
                mask=masks[i]
            )
            predictions.append(prediction)

        print(f"Pipeline Inference time: {(time.perf_counter() - start)*1000:.2f} ms")
        return predictions
