from typing import List, Optional
from datasets import load_dataset
import chromadb
import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer
from tqdm import tqdm
from huggingface_hub import hf_hub_download
from .embedder import Embedder

def get_or_create_collection(persist_directory: str, collection_name: str):
    client = chromadb.PersistentClient(path=persist_directory)
    try:
        collection = client.get_collection(collection_name)
    except Exception:
        collection = client.create_collection(collection_name)
    return collection


def ingest_hf_dataset_to_chroma(
    hf_dataset_name: str,
    collection_name: str,
    batch_size: int = 64,
    persist_directory: Optional[str] = "./chroma_db",
):
    """
    This function ingests a Hugging Face dataset into Chroma DB.
    It loads the dataset from Hugging Face, uses the FOOD_NAME to create embeddings, and inserts them along with their full records as metadata into Chroma.
    If the Chroma collection already has records, ingestion is skipped.
    """
    print(f"Loading HF dataset: {hf_dataset_name}")
    ds_dict = load_dataset(hf_dataset_name)
    if "train" in ds_dict:
        ds = ds_dict["train"]
    else:
        # Pick arbitrary first split if 'train' does not exist
        split_name = list(ds_dict.keys())[0]
        print(f"No 'train' split found; using split '{split_name}'")
        ds = ds_dict[split_name]
    n = len(ds)
    print(f"Loaded {n} records from HF dataset.")

    embedder = Embedder()
    collection = get_or_create_collection(persist_directory, collection_name)

    # Check if the collection already has data
    try:
        count = collection.count()
        if count > 0:
            print(f"Collection '{collection_name}' already contains {count} records. Skipping ingestion.")
            return
    except Exception:
        print("Ingestion start. Collection:", collection_name)

    ids_batch = []
    metadatas_batch = []
    embeddings_batch = []

    with tqdm(range(0, n, batch_size), desc="Ingesting batches") as pbar:
        for i in pbar:
            end_idx = min(i + batch_size, n)
            indices = list(range(i, end_idx))
            chunk = ds.select(indices)
            
            chunk_list = [chunk[j] for j in range(len(chunk))]
            names = [
                row.get("FOOD_NAME")
                if isinstance(row.get("FOOD_NAME"), str) and row.get("FOOD_NAME").strip()
                else "UNKNOWN_FOOD"
                for row in chunk_list
            ]
            name_embs = embedder.embed(names).tolist()

            for idx, row in enumerate(chunk):
                record_id = str(row.get("FOOD_RECORD_ID", f"{i+idx}"))
                emb = name_embs[idx]

                metadata = dict(row)
                for k, v in list(metadata.items()):
                    if v is None:
                        metadata[k] = "NONE"
                    elif hasattr(v, 'tolist'):
                        metadata[k] = v.tolist()
                    else:
                        metadata[k] = v

                ids_batch.append(record_id)
                metadatas_batch.append(metadata)
                embeddings_batch.append(emb)

            if not ids_batch:
                return
            collection.add(
                ids=ids_batch,
                metadatas=metadatas_batch,
                embeddings=embeddings_batch
            )
            ids_batch.clear()
            metadatas_batch.clear()
            embeddings_batch.clear()

            pbar.update(0)
            pbar.set_postfix({"Last Inserted": f"({i}, {min(i+batch_size, n)-1})"})

    print("Ingestion complete. Collection:", collection_name)

if __name__ == "__main__":
    ingest_hf_dataset_to_chroma("magnusdtd/usda_branded_food", "food_records")