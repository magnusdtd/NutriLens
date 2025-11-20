from huggingface_hub import HfApi

def main():
    api = HfApi()

    api.upload_file(
        path_or_fileobj="../checkpoints/yolov8_foodseg103.onnx",
        path_in_repo="yolov8_foodseg103.onnx",
        repo_id="magnusdtd/yolov8-foodseg103",
        repo_type="model",
    )

    api.upload_file(
        path_or_fileobj="../checkpoints/yolov8_foodseg103.pt",
        path_in_repo="yolov8_foodseg103.pt",
        repo_id="magnusdtd/yolov8-foodseg103",
        repo_type="model",
    )

if __name__ == "__main__":
    main()