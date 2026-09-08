from .detector import detect_document_type
from .pdf_parser import extract_text_from_pdf
from .docx_parser import extract_text_from_docx

__all__ = [
    'detect_document_type',
    'extract_text_from_pdf',
    'extract_text_from_docx'
]
