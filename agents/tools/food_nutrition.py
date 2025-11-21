import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from langchain.tools import tool

from ..utils.ingest_data import get_or_create_collection
from ..utils.embedder import Embedder

@dataclass
class SearchResult:
    title: str
    link: str
    description: str
    source: Optional[str] = None

class FoodChromaRetriever:
    def __init__(
        self, 
        collection_name: str = "food_records", 
        persist_directory: Optional[str] = "./chroma_db", 
    ):
        self.collection = get_or_create_collection(persist_directory, collection_name)
        self.embedder = Embedder()

    def retrieve_by_name(
        self, 
        food_name: str, 
        k: int = 3, 
        include_distances: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Given a food_name (string), embed it and query Chroma for top-k nearest.
        Returns a list of result dicts containing: id, score (distance or similarity), metadata.
        """
        query_emb = self.embedder.embed([food_name])[0]
        res = self.collection.query(
            query_embeddings=[query_emb],
            n_results=k,
            include=["metadatas", "distances", "ids"],
        )

        if not res or len(res.get("ids", [])) == 0:
            return []

        out = []
        ids = res.get("ids", [[]])[0]
        metadatas = res.get("metadatas", [[]])[0]
        distances = (
            res.get("distances", [[]])[0] if include_distances else [None] * len(ids)
        )

        for i, _id in enumerate(ids):
            out.append(
                {
                    "id": _id,
                    "metadata": metadatas[i] if i < len(metadatas) else None,
                    "distance": distances[i] if i < len(distances) else None,
                }
            )
        return out

retriever = FoodChromaRetriever()

@tool(
    description=(
        "Look up nutrition records by food name. "
        "Args: food_name (str), k (int, optional, default=3). "
        "Returns JSON with top-k records and metadata."
    ),
)
def food_nutrition_tool(food_name: str, k: int = 3):
    try:
        results = retriever.retrieve_by_name(food_name, k=k)
        return json.dumps(results, default=str, ensure_ascii=False, indent=2)
    except Exception as e:
        return f"Error retrieving food: {e}"
