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

def detect_document_type(filename: str, file_bytes: bytes = None) -> Tuple[str, str]:
    ext = os.path.splitext(filename)[1].lower()
    guessed_type, _ = mimetypes.guess_type(filename)
    
    doc_type = SUPPORTED_EXTENSIONS.get(ext, 'unknown')
    
    # Check magic bytes if available
    if file_bytes and len(file_bytes) >= 4:
        if file_bytes.startswith(b'%PDF'):
            doc_type = 'pdf'
            guessed_type = 'application/pdf'
        elif file_bytes.startswith(b'PK  ') and ext in ['.docx', '.doc']:
            doc_type = 'docx'
            guessed_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif file_bytes[:8] == b'\x89PNG\r\n\x1a\n':
            doc_type = 'image'
            guessed_type = 'image/png'
        elif file_bytes[:3] == b'\xff\xd8\xff':
            doc_type = 'image'
            guessed_type = 'image/jpeg'
            
    return doc_type, guessed_type or 'application/octet-stream'
