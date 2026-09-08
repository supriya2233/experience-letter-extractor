import os
import json
from typing import Tuple, Dict, Any
from openai import OpenAI
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
- confidence_scores: object mapping each field to an estimated certainty 0-100

Rules:
1. Do not invent information.
2. If a field is not available, return null.
3. Normalize dates into YYYY-MM-DD format whenever possible.
4. Return valid JSON only.
"""

class OpenAIExtractionProvider(AIExtractionProvider):
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def extract(self, text: str) -> Tuple[ExperienceLetterData, Dict[str, Any]]:
        response = self.client.chat.completions.create(
            model='gpt-4o',
            response_format={'type': 'json_object'},
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': f'Extract information from this document:\n\n{text}'}
            ],
            temperature=0.1
        )
        content_text = response.choices[0].message.content.strip()
        parsed_json = json.loads(content_text)
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
            confidence_note='Estimated extraction certainty reported by OpenAI GPT-4o.',
            processing_method='OpenAI GPT-4o Extraction',
            validation_status='Extracted'
        )
        return data, parsed_json
