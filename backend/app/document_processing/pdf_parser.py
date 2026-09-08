import io
from typing import Tuple
import pymupdf as fitz

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int, bool]:
    doc = fitz.open(stream=file_bytes, filetype='pdf')
    total_pages = doc.page_count
    extracted_text_list = []
    
    for page_num in range(total_pages):
        page = doc.load_page(page_num)
        text = page.get_text('text')
        extracted_text_list.append(text)
        
    full_text = '\n\n--- Page Break ---\n\n'.join(extracted_text_list).strip()
    
    # Check if this PDF has selectable text or is likely a scanned PDF
    clean_text = ''.join(full_text.split())
    is_scanned = len(clean_text) < 30
    
    doc.close()
    return full_text, total_pages, is_scanned
