from abc import ABC, abstractmethod
from typing import Tuple, Dict, Any
from ..types.schemas import ExperienceLetterData

class AIExtractionProvider(ABC):
    @abstractmethod
    def extract(self, text: str) -> Tuple[ExperienceLetterData, Dict[str, Any]]:
        pass
