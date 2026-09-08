import os
from typing import Tuple
from .base_provider import AIExtractionProvider
from .mock_provider import MockAIProvider
from .claude_provider import ClaudeExtractionProvider
from .openai_provider import OpenAIExtractionProvider

def get_ai_provider() -> Tuple[AIExtractionProvider, bool, str]:
    requested = os.getenv('AI_PROVIDER', '').lower()
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    openai_key = os.getenv('OPENAI_API_KEY')

    if (requested == 'claude' or not requested) and anthropic_key:
        try:
            return ClaudeExtractionProvider(api_key=anthropic_key), False, 'Anthropic Claude'
        except Exception:
            pass

    if (requested == 'openai' or not requested) and openai_key:
        try:
            return OpenAIExtractionProvider(api_key=openai_key), False, 'OpenAI GPT-4o'
        except Exception:
            pass

    return MockAIProvider(), True, 'Mock AI Provider (Simulated)'
