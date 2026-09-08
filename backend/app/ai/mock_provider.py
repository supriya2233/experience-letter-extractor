import re
from datetime import datetime
from typing import Tuple, Dict, Any, Optional
from ..types.schemas import ExperienceLetterData
from .base_provider import AIExtractionProvider

def parse_date_to_iso(date_str: str) -> Optional[str]:
    if not date_str:
        return None
    cleaned = date_str.strip(' ,.')
    formats = [
        '%B %d, %Y', '%B %d %Y', '%b %d, %Y', '%b %d %Y',
        '%d %B %Y', '%d %b %Y', '%d-%m-%Y', '%d/%m/%Y',
        '%Y-%m-%d', '%Y/%m/%d', '%B %Y', '%b %Y'
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(cleaned, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    return None

def calculate_duration(start_iso: Optional[str], end_iso: Optional[str]) -> Optional[str]:
    if not start_iso or not end_iso:
        return None
    try:
        d1 = datetime.fromisoformat(start_iso)
        d2 = datetime.fromisoformat(end_iso)
        diff_days = (d2 - d1).days
        if diff_days <= 0:
            return None
        years = diff_days // 365
        remaining_days = diff_days % 365
        months = remaining_days // 30
        
        parts = []
        if years > 0:
            parts.append(str(years) + ' Year' + ('s' if years > 1 else ''))
        if months > 0:
            parts.append(str(months) + ' Month' + ('s' if months > 1 else ''))
        return ' '.join(parts) if parts else str(diff_days) + ' Days'
    except Exception:
        return None

class MockAIProvider(AIExtractionProvider):
    def extract(self, text: str) -> Tuple[ExperienceLetterData, Dict[str, Any]]:
        lower_text = text.lower()
        
        # Check Sample 1 (Standard Experience Letter)
        if 'supriya' in lower_text or 'abc technologies' in lower_text:
            data = ExperienceLetterData(
                document_type='Experience Letter',
                employee_name='Supriya Sanjeevakumar',
                company_name='ABC Technologies Pvt. Ltd.',
                designation='Software Engineer',
                employment_type='Full-time',
                joining_date='2023-01-10',
                last_working_date='2026-08-30',
                employment_duration='3 Years 7 Months',
                letter_issue_date='2026-09-01',
                signatory_name='Rahul Sharma',
                signatory_designation='HR Manager',
                confidence_scores={
                    'employee_name': 98,
                    'company_name': 99,
                    'designation': 96,
                    'employment_type': 88,
                    'joining_date': 95,
                    'last_working_date': 95,
                    'employment_duration': 92,
                    'letter_issue_date': 94,
                    'signatory_name': 95,
                    'signatory_designation': 94,
                },
                confidence_note='Estimated extraction confidence (Mock AI Mode).',
                processing_method='Mock AI Mode (simulated rules & semantics)',
                validation_status='Valid'
            )
            return data, data.model_dump()
            
        # Check Sample 2 (Different Writing Style)
        if 'arjun' in lower_text or 'xyz solutions' in lower_text:
            data = ExperienceLetterData(
                document_type='Experience Certificate',
                employee_name='Arjun Kumar',
                company_name='XYZ Solutions Private Limited',
                designation='Senior Software Developer',
                employment_type='Full-time',
                joining_date='2021-03-15',
                last_working_date='2024-07-20',
                employment_duration='3 Years 4 Months',
                letter_issue_date='2024-07-25',
                signatory_name='Priya Menon',
                signatory_designation='Human Resources Director',
                confidence_scores={
                    'employee_name': 98,
                    'company_name': 97,
                    'designation': 96,
                    'employment_type': 99,
                    'joining_date': 94,
                    'last_working_date': 95,
                    'employment_duration': 93,
                    'letter_issue_date': 94,
                    'signatory_name': 97,
                    'signatory_designation': 96,
                },
                confidence_note='Estimated extraction confidence (Mock AI Mode).',
                processing_method='Mock AI Mode (simulated rules & semantics)',
                validation_status='Valid'
            )
            return data, data.model_dump()
            
        # Check Sample 3 (Missing Information Sample)
        if 'ananya' in lower_text or 'innovate labs' in lower_text:
            data = ExperienceLetterData(
                document_type='Experience Letter',
                employee_name='Ananya Sharma',
                company_name='Innovate Labs',
                designation='Data Analyst',
                employment_type=None,
                joining_date=None,
                last_working_date=None,
                employment_duration='Approximately 3 years',
                letter_issue_date=None,
                signatory_name=None,
                signatory_designation=None,
                confidence_scores={
                    'employee_name': 96,
                    'company_name': 95,
                    'designation': 94,
                    'employment_type': 0,
                    'joining_date': 0,
                    'last_working_date': 0,
                    'employment_duration': 85,
                    'letter_issue_date': 0,
                    'signatory_name': 0,
                    'signatory_designation': 0,
                },
                confidence_note='Estimated extraction confidence (Mock AI Mode). Missing fields scored 0%.',
                processing_method='Mock AI Mode (simulated rules & semantics)',
                validation_status='Missing Required Information'
            )
            return data, data.model_dump()

        # Generic heuristic / regex fallback
        emp_name = None
        name_match = re.search(r'(?:certify that|confirm that)\s+(?:Mr\.|Ms\.|Mrs\.)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})', text)
        if name_match:
            emp_name = name_match.group(1).strip()
            
        company_name = None
        comp_match = re.search(r'(?:employed with|worked with|employed by|organization\s+)\s*([A-Z0-9][A-Za-z0-9\s.,&-]+?(?:Ltd|Limited|Inc|Corporation|Corp|Labs|Technologies|Solutions|Services))', text)
        if comp_match:
            company_name = comp_match.group(1).strip()
            
        designation = None
        desig_match = re.search(r'(?:as a|as an|role of|position of)\s+([A-Za-z\s]+?(?:Engineer|Developer|Analyst|Manager|Consultant|Specialist|Lead|Director|Associate))', text, re.IGNORECASE)
        if desig_match:
            designation = desig_match.group(1).strip()

        joining_date = None
        last_working_date = None
        date_range_match = re.search(r'from\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})\s+to\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})', text, re.IGNORECASE)
        if date_range_match:
            joining_date = parse_date_to_iso(date_range_match.group(1))
            last_working_date = parse_date_to_iso(date_range_match.group(2))
        else:
            between_match = re.search(r'between\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})\s+and\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})', text, re.IGNORECASE)
            if between_match:
                joining_date = parse_date_to_iso(between_match.group(1))
                last_working_date = parse_date_to_iso(between_match.group(2))

        duration = calculate_duration(joining_date, last_working_date)
        if not duration:
            dur_match = re.search(r'(\d+\s+years?(?:\s+\d+\s+months?)?|approximately\s+\d+\s+years?)', text, re.IGNORECASE)
            if dur_match:
                duration = dur_match.group(1).strip()

        emp_type = 'Full-time' if 'full-time' in lower_text else ('Part-time' if 'part-time' in lower_text else None)

        scores = {
            'employee_name': 85 if emp_name else 0,
            'company_name': 85 if company_name else 0,
            'designation': 80 if designation else 0,
            'employment_type': 75 if emp_type else 0,
            'joining_date': 85 if joining_date else 0,
            'last_working_date': 85 if last_working_date else 0,
            'employment_duration': 80 if duration else 0,
            'letter_issue_date': 0,
            'signatory_name': 0,
            'signatory_designation': 0,
        }

        data = ExperienceLetterData(
            document_type='Experience Letter',
            employee_name=emp_name,
            company_name=company_name,
            designation=designation,
            employment_type=emp_type,
            joining_date=joining_date,
            last_working_date=last_working_date,
            employment_duration=duration,
            letter_issue_date=None,
            signatory_name=None,
            signatory_designation=None,
            confidence_scores=scores,
            confidence_note='Estimated extraction confidence (Generic regex heuristics).',
            processing_method='Mock AI Mode (generic heuristic parsing)',
            validation_status='Pending Review'
        )
        return data, data.model_dump()
