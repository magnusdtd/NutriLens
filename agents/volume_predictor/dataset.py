from datasets import load_dataset
import numpy as np
import os
from tqdm import tqdm
import cv2
import requests
import json
import random
import torch
from datasets import DatasetDict
import shutil

def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False

def convert_split_to_yolo(split, split_name, out_dir="foodseg103_yolo", pad=0):
    """
    Convert dataset split to YOLO format with optional padding.

    Args:
        split: dataset split
        split_name: 'train', 'val', etc.
        out_dir: output folder
        pad: number of pixels to pad around the image/mask
    """
    os.makedirs(f"{out_dir}/{split_name}/images", exist_ok=True)
    os.makedirs(f"{out_dir}/{split_name}/labels", exist_ok=True)

    print(f"Converting {split_name} ({len(split)} samples)")

    for i, ex in tqdm(enumerate(split), total=len(split)):
        # Save image
        img = ex["image"].convert("RGB")
        img_np = np.array(img)
        h, w = img_np.shape[:2]

        # Pad image
        img_padded = cv2.copyMakeBorder(img_np, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=[0,0,0])
        new_h, new_w = img_padded.shape[:2]
        img_path = f"{out_dir}/{split_name}/images/{i:06d}.jpg"
        cv2.imwrite(img_path, cv2.cvtColor(img_padded, cv2.COLOR_RGB2BGR))

        # Load masks and pad
        label = ex["label"].convert("L")
        masks = np.array(label, dtype=np.uint8)  # (H, W)
        masks_padded = cv2.copyMakeBorder(masks, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)

        class_ids = ex.get("classes_on_image", [])
        yolo_lines = []

        for cls in class_ids:
            if cls == 0:  # background
                continue

            binary = ((masks_padded == cls).astype(np.uint8)) * 255
            binary = np.ascontiguousarray(binary)
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                continue

            for c in contours:
                c = c.reshape(-1, 2).astype(float)
                # Normalize by **padded size**
                c[:, 0] /= new_w
                c[:, 1] /= new_h
                pts = " ".join([f"{x:.6f} {y:.6f}" for x, y in c])
                yolo_lines.append(f"{cls} {pts}")

        # write label file
        label_path = f"{out_dir}/{split_name}/labels/{i:06d}.txt"
        with open(label_path, "w") as f:
            f.write("\n".join(yolo_lines))

def get_id2json(url):
    response = requests.get(url)
    if response.status_code == 200:
        print("File download successful!")
    else:
        print(f"Error downloading file. Status code: {response.status_code}")
    local_filename = "./foodseg103_yolo/id2label.json"
    with open(local_filename, 'wb') as f:
        f.write(response.content)
    print(f"File saved as {local_filename}")

    id2label = {}
    with open(local_filename, 'r') as file:
        id2label = json.load(file)
    return id2label

def zip_folder(source_folder_path, output_zip_path):
    """
    Zips the contents of a specified folder into a new ZIP archive.

    Args:
        source_folder_path (str): The path to the folder to be zipped.
        output_zip_path (str): The desired path and name for the output ZIP file
                                (without the .zip extension).
    """
    try:
        shutil.make_archive(output_zip_path, 'zip', source_folder_path)
        print(f"Folder '{source_folder_path}' successfully zipped to '{output_zip_path}.zip'")
    except Exception as e:
        print(f"Error zipping folder '{source_folder_path}': {e}")


def main():
    SEED = 42
    set_seed(SEED)

    ds = load_dataset("EduardoPacheco/FoodSeg103")
    test_frac_of_validation = 0.3333   # 10% of total
    split = ds["validation"].train_test_split(test_size=test_frac_of_validation, seed=SEED, shuffle=True)

    # split returns {'train': new_validation, 'test': test}
    new_validation = split["train"]
    new_test = split["test"]
    ds = DatasetDict({
        "train": ds["train"],
        "validation": new_validation,
        "test": new_test
    })

    convert_split_to_yolo(ds["train"], "train")
    convert_split_to_yolo(ds["validation"], "val")
    convert_split_to_yolo(ds["test"], "test")

    id2label = get_id2json(
        "https://huggingface.co/datasets/EduardoPacheco/FoodSeg103/resolve/main/id2label.json"
    )

    zip_folder("foodseg103_yolo", "foodseg103_yolo")


if __name__ == "__main__":
    main()