import io
from PIL import Image
import pytesseract
import pymupdf as fitz
from .base_ocr import OCRProvider

class TesseractOCRProvider(OCRProvider):
    def __init__(self):
        self.is_available = self._check_availability()

    def _check_availability(self) -> bool:
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        if not self.is_available:
            return (
                '[OCR Fallback Notice]: Tesseract OCR binary was not detected on the host system PATH. '
                'To enable local image OCR, please install Tesseract OCR (e.g. from UB-Mannheim/tesseract/w64) '
                'and add it to PATH. In this demo mode, please use digital PDFs, DOCX, or the provided sample letters.'
            )
        try:
            img = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(img)
            return text.strip()
        except Exception as e:
            return f'[OCR Processing Error]: {str(e)}'

    def extract_text_from_scanned_pdf(self, pdf_bytes: bytes) -> str:
        doc = fitz.open(stream=pdf_bytes, filetype='pdf')
        page_texts = []
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes('png')
            page_text = self.extract_text_from_image(img_bytes)
            page_texts.append(f'--- Page {page_num + 1} OCR ---\n{page_text}')
        doc.close()
        return '\n\n'.join(page_texts).strip()
