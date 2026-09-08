import os
import mimetypes
from typing import Tuple

SUPPORTED_EXTENSIONS = {
    '.pdf': 'pdf',
    '.docx': 'docx',
    '.doc': 'docx',
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.webp': 'image',
    '.tiff': 'image',
    '.txt': 'text'
}

PNG_MAGIC  = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
JPEG_MAGIC = bytes([0xFF, 0xD8, 0xFF])

def detect_document_type(filename: str, file_bytes: bytes = None) -> Tuple[str, str]:
    ext = os.path.splitext(filename)[1].lower()
    guessed_type, _ = mimetypes.guess_type(filename)

    doc_type = SUPPORTED_EXTENSIONS.get(ext, 'unknown')

    # Check magic bytes if available
    if file_bytes and len(file_bytes) >= 8:
        if file_bytes[:4] == b'%PDF':
            doc_type = 'pdf'
            guessed_type = 'application/pdf'
        elif file_bytes[:4] == b'PK\x03\x04' and ext in ['.docx', '.doc']:
            doc_type = 'docx'
            guessed_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif file_bytes[:8] == PNG_MAGIC:
            doc_type = 'image'
            guessed_type = 'image/png'
        elif file_bytes[:3] == JPEG_MAGIC:
            doc_type = 'image'
            guessed_type = 'image/jpeg'

    return doc_type, guessed_type or 'application/octet-stream'
