"""
CLOVA OCR LangChain Tool
- Supports local file path (jpg/png/pdf/tiff), raw bytes, file-like object, or URL.
- Sends multipart/form-data with 'file' + 'message' JSON as required by the API.
- Returns a dict with:
    - raw: original JSON response
    - text: reconstructed plain text
    - words: list of word tokens with bounding boxes and confidences
    - images: per-image metadata (pageIndex, width, height, fields...)
"""

from typing import Any, Dict, List, Optional, Union
import json
import time
import mimetypes
import io, os
import requests
from uuid import uuid4
from langchain.tools import tool

DEFAULT_ENDPOINT = "https://wfpe2zs5m6.apigw.ntruss.com/NutriLens_OCR/NutriLens_OCR_api/"

def _guess_mime_and_ext(filename: str):
    mime, _ = mimetypes.guess_type(filename)
    if mime is None:
        # fallback heuristics
        ext = filename.split('.')[-1].lower()
        if ext in ('jpg', 'jpeg'):
            mime = 'image/jpeg'
        elif ext == 'png':
            mime = 'image/png'
        elif ext in ('pdf',):
            mime = 'application/pdf'
        elif ext in ('tif', 'tiff'):
            mime = 'image/tiff'
        else:
            mime = 'application/octet-stream'
    else:
        _, ext = mimetypes.guess_extension(mime), None
    return mime

def _assemble_text_from_fields(fields: List[Dict[str, Any]]) -> str:
    """
    Reconstruct plain text from fields. Uses 'lineBreak' boolean to place newline.
    If not present, joins tokens with spaces.
    """
    out_parts = []
    for f in fields:
        txt = f.get("inferText", "")
        if txt is None:
            txt = ""
        # Some responses contain fragments, so preserve them
        out_parts.append(txt)
        # Add newline if lineBreak True, otherwise space
        if f.get("lineBreak", False):
            out_parts.append("\n")
        else:
            out_parts.append(" ")
    # join and normalize whitespace
    combined = "".join(out_parts)
    # collapse multiple spaces but preserve newlines
    lines = [ " ".join(line.split()) for line in combined.splitlines() ]
    return "\n".join([ln for ln in lines if ln.strip() != ""])

def _parse_response(resp_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse the CLOVA OCR API response and return structured output.
    """
    images_out = []
    full_text_parts = []
    words = []
    for img in resp_json.get("images", []):
        fields = img.get("fields", [])
        # assemble text for this image
        img_text = _assemble_text_from_fields(fields)
        full_text_parts.append(img_text)
        # collect word-level info
        field_entries = []
        for f in fields:
            entry = {
                "text": f.get("inferText"),
                "confidence": f.get("inferConfidence"),
                "type": f.get("type"),
                "valueType": f.get("valueType"),
                "lineBreak": f.get("lineBreak", False),
                "boundingPoly": f.get("boundingPoly"),
            }
            field_entries.append(entry)
            words.append(entry)
        images_out.append({
            "uid": img.get("uid"),
            "name": img.get("name"),
            "inferResult": img.get("inferResult"),
            "message": img.get("message"),
            "convertedImageInfo": img.get("convertedImageInfo"),
            "fields": field_entries
        })
    plain_text = "\n\n".join([p for p in full_text_parts if p.strip() != ""])
    return {
        "raw": resp_json,
        "text": plain_text,
        "words": words,
        "images": images_out
    }

def clova_ocr_invoke(
    file_input: Union[str, bytes, io.IOBase],
    secret: str,
    endpoint: str = DEFAULT_ENDPOINT,
    default_lang: str = "ko",
    timeout: int = 60,
    lang: Optional[str] = None,
) -> Dict[str, Any]:
    """
    This function sends data to the CLOVA OCR API and returns structured OCR result.
    Accepts file path (str), bytes, file-like object, or URL as input.
    """
    # --- Read file content and determine filename ---
    def _read_file_bytes(file_input):
        if isinstance(file_input, bytes):
            return file_input, "image"
        if isinstance(file_input, io.IOBase):
            file_input.seek(0)
            content = file_input.read()
            return content, getattr(file_input, "name", "image")
        if isinstance(file_input, str):
            if file_input.startswith("http://") or file_input.startswith("https://"):
                r = requests.get(file_input, timeout=timeout)
                r.raise_for_status()
                url_filename = file_input.split("/")[-1] or "image"
                return r.content, url_filename
            else:
                with open(file_input, "rb") as f:
                    content = f.read()
                filename = file_input.split("/")[-1]
                return content, filename
        raise ValueError("Unsupported file_input type; pass bytes, file-like, or path/URL string.")

    content, filename = _read_file_bytes(file_input)
    mime = _guess_mime_and_ext(filename)

    ext = (filename.split('.')[-1].lower() if '.' in filename else "png")
    message_obj = {
        "version": "v2",
        "requestId": str(uuid4()),
        "timestamp": int(time.time() * 1000),
        "lang": lang or default_lang,
        "images": [
            {
                "format": ext,
                "name": filename
            }
        ]
    }

    headers = {
        "X-OCR-SECRET": secret
    }
    files = {
        "file": (filename, content, mime)
    }
    data = {
        "message": json.dumps(message_obj)
    }

    resp = requests.post(endpoint, headers=headers, data=data, files=files, timeout=timeout)
    try:
        resp.raise_for_status()
    except Exception as e:
        raise RuntimeError(
            f"CLOVA OCR request failed: {e}\nResponse status: {resp.status_code}\nBody: {resp.text}"
        ) from e

    resp_json = resp.json()
    return _parse_response(resp_json)

@tool(
    description=(
        "Use this tool to extract text from an image or PDF using the CLOVA OCR API. "
        "Input: file path (str), bytes, file-like object, or a URL. "
        "Returns JSON with keys: raw, text, words, images. "
        "You must supply the CLOVA OCR secret key via environment variable CLOVA_OCR_SECRET."
    ),
)
def clova_ocr_tool(
    file_input,
    endpoint=DEFAULT_ENDPOINT,
    default_lang="ko",
    timeout=60,
    lang=None,
):
    """
    LangChain Tool for CLOVA OCR.
    file_input: file path (str), bytes, file-like object, or URL.
    """
    secret = os.environ.get("CLOVA_OCR_SECRET")
    try:
        result = clova_ocr_invoke(
            file_input=file_input,
            secret=secret,
            endpoint=endpoint,
            default_lang=default_lang,
            timeout=timeout,
            lang=lang,
        )
        return json.dumps(result, ensure_ascii=False, default=str, indent=2)
    except Exception as e:
        return f"Error in CLOVA OCR: {e}"

