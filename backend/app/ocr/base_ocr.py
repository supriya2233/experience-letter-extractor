from abc import ABC, abstractmethod

class OCRProvider(ABC):
    @abstractmethod
    def extract_text_from_image(self, image_bytes: bytes) -> str:
        pass
        
    @abstractmethod
    def extract_text_from_scanned_pdf(self, pdf_bytes: bytes) -> str:
        pass
