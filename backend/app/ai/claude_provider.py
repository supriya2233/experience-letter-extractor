import os
import json
from typing import Tuple, Dict, Any
import anthropic
from ..types.schemas import ExperienceLetterData
from .base_provider import AIExtractionProvider

SYSTEM_PROMPT = """You are an intelligent document information extraction system.
Analyze the provided document and determine whether it is an Experience Letter.
Extract only information that is explicitly mentioned or can be confidently inferred from the document.
Return the result in structured JSON.

Required fields:
- employee_name
- company_name
- designation
- employment_type
- joining_date in YYYY-MM-DD format if possible
- last_working_date in YYYY-MM-DD format if possible
- employment_duration
- letter_issue_date in YYYY-MM-DD format if possible
- document_type
- signatory_name
- signatory_designation
- confidence_scores: dict mapping each field to an estimated certainty 0-100

Rules:
1. Do not invent information.
2. If a field is not available, return null.
3. Normalize dates into YYYY-MM-DD format whenever possible.
4. Clearly identify the document type.
5. Return valid JSON only.
"""

class ClaudeExtractionProvider(AIExtractionProvider):
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    def extract(self, text: str) -> Tuple[ExperienceLetterData, Dict[str, Any]]:
        message = self.client.messages.create(
            model='claude-3-5-sonnet-20241022',
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{
                'role': 'user',
                'content': f'Here is the experience letter document text:\n\n{text}\n\nPlease extract the structured JSON.'
            }]
        )
        content_text = message.content[0].text.strip()
        if content_text.startswith('`json'):
            content_text = content_text[7:]
        if content_text.endswith('`'):
            content_text = content_text[:-3]
        parsed_json = json.loads(content_text.strip())
        conf = parsed_json.get('confidence_scores', {})
        data = ExperienceLetterData(
            document_type=parsed_json.get('document_type', 'Experience Letter'),
            employee_name=parsed_json.get('employee_name'),
            company_name=parsed_json.get('company_name'),
            designation=parsed_json.get('designation'),
            employment_type=parsed_json.get('employment_type'),
            joining_date=parsed_json.get('joining_date'),
            last_working_date=parsed_json.get('last_working_date'),
            employment_duration=parsed_json.get('employment_duration'),
            letter_issue_date=parsed_json.get('letter_issue_date'),
            signatory_name=parsed_json.get('signatory_name'),
            signatory_designation=parsed_json.get('signatory_designation'),
            confidence_scores=conf,
            confidence_note='Estimated extraction confidence reported by Claude LLM.',
            processing_method='Anthropic Claude 3.5 Sonnet Extraction',
            validation_status='Extracted'
        )
        return data, parsed_json
