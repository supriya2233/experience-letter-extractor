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
        '%B %d, %Y', '%B %d %Y', '%b %d, %Y', '%b %d %Y', '%d-%b-%Y', '%d-%B-%Y',
        '%d %B %Y', '%d %b %Y', '%d-%m-%Y', '%d/%m/%Y',
        '%Y-%m-%d', '%Y/%m/%d', '%B %Y', '%b %Y', '%d/%m/%Y', '%m/%d/%Y'
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


def confidence_score(
    value: Optional[str],
    *,
    explicit: bool = False,
    normalized: bool = False,
    corroborated: bool = False,
    fallback: bool = False,
) -> int:
    """Estimate field certainty from observable extraction evidence.

    This is a heuristic score, not a calibrated probability. Explicit source
    wording, normalized values, and independent supporting evidence increase
    the score; fallback-only matches are intentionally lower.
    """
    if not value or not value.strip():
        return 0
    score = 60
    if explicit:
        score += 15
    if normalized:
        score += 10
    if corroborated:
        score += 10
    if fallback:
        score -= 15
    return max(0, min(100, score))

class MockAIProvider(AIExtractionProvider):
    def extract(self, text: str) -> Tuple[ExperienceLetterData, Dict[str, Any]]:
        lower_text = text.lower()
        # Generic heuristic / regex fallback
        emp_name = None
        name_match = re.search(r'(?:certify that|confirm that|we certify that)\s+(?:Mr\.|Ms\.|Mrs\.)?\s*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})', text)
        if not name_match:
            name_match = re.search(r'Employee Name\s*:\s*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})', text)
        if not name_match:
            name_match = re.search(r'Employee\s*:\s*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})', text)
        if not name_match:
            name_match = re.search(r'(?:Mr\.|Ms\.|Mrs\.)\s*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})[ \t]+(?:was employed|worked|joined)', text)
        if not name_match:
            name_match = re.search(r'(?m)^\s*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})[ \t]+(?:worked|joined)', text)
        if not name_match:
            name_match = re.search(r'(?m)^\s*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})[ \t]+was employed', text)
        if not name_match:
            name_match = re.search(r'(?:certifies that|confirm that)\s+([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})[ \t]+(?:was employed|worked)', text, re.IGNORECASE)
        if name_match:
            emp_name = name_match.group(1).strip()
            
        company_name = None
        company_explicit = False
        company_fallback = False
        comp_match = re.search(
            r'(?:employed with|worked with|employed by|worked for|worked at|employed at)\s+'
            r'(.+?)\s+(?:as|between|from)\b',
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if not comp_match:
            comp_match = re.search(r'(?:organization\s+|our organization\s+)\s*([A-Z0-9][A-Za-z0-9\s.,&-]+?(?:Ltd|Limited|Inc|Corporation|Corp|Labs|Technologies|Solutions|Services))', text, re.IGNORECASE)
        if not comp_match:
            comp_match = re.search(r'Company Name\s*:\s*([^\n]+)', text, re.IGNORECASE)
        if not comp_match:
            comp_match = re.search(r'joined\s+([A-Z][A-Za-z0-9 ]+?)\s+(?:on|as)\b', text)
        if comp_match:
            company_name = ' '.join(comp_match.group(1).split()).strip(' ,.')
            company_explicit = True
        if not company_name or company_name.lower() == 'our organization':
            headings = re.findall(r'(?m)^\s*([A-Z][A-Z0-9 &.-]{4,})\s*$', text)
            excluded = {
                'EXPERIENCE LETTER', 'EXPERIENCE CERTIFICATE', 'EMPLOYMENT CERTIFICATE',
                'TO WHOMSOEVER IT MAY CONCERN', 'EMPLOYMENT HISTORY',
                'CURRENT EMPLOYMENT LETTER', 'EMPLOYMENT VERIFICATION',
                'CAREER CERTIFICATE', 'ACME TECHNOLOGIES - EXPERIENCE LETTER',
            }
            company_name = next((heading.title() for heading in headings if heading not in excluded), company_name)
            company_fallback = bool(company_name)
            
        designation = None
        desig_match = re.search(r'(?:as a|as an|served as|role of|position of|held the position of)\s+(?:an?\s+)?([A-Za-z\s]+?(?:Engineer|Developer|Analyst|Manager|Consultant|Specialist|Lead|Director|Associate|Tester))', text, re.IGNORECASE)
        if not desig_match:
            desig_match = re.search(r'Designation\s*:\s*([A-Za-z ]+)', text, re.IGNORECASE)
        if desig_match:
            designation = desig_match.group(1).strip()

        joining_date = None
        last_working_date = None
        date_pattern = r'(?:[A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{1,2}-[A-Za-z]+-\d{4})'
        date_range_matches = list(re.finditer(rf'(?:from|between)\s+({date_pattern})\s+(?:to|and)\s+({date_pattern})', text, re.IGNORECASE))
        date_range_match = date_range_matches[0] if date_range_matches else None
        if date_range_matches:
            parsed_ranges = [
                (parse_date_to_iso(match.group(1)), parse_date_to_iso(match.group(2)))
                for match in date_range_matches
            ]
            valid_ranges = [(start, end) for start, end in parsed_ranges if start and end]
            if valid_ranges:
                joining_date = min(start for start, _ in valid_ranges)
                last_working_date = max(end for _, end in valid_ranges)

        joined_match = re.search(r'(?:joined|started employment)(?:\s+[^\n.]+?)?\s+(?:on\s+)?(' + date_pattern + r')', text, re.IGNORECASE)
        if not joining_date and joined_match:
            joining_date = parse_date_to_iso(joined_match.group(1))

        labeled_joining_match = re.search(r'(?:date joined|joining date)\s*:\s*(' + date_pattern + r')', text, re.IGNORECASE)
        if not joining_date and labeled_joining_match:
            joining_date = parse_date_to_iso(labeled_joining_match.group(1))

        labeled_last_match = re.search(r'(?:last working day|last working date)\s*:\s*(' + date_pattern + r')', text, re.IGNORECASE)
        if not last_working_date and labeled_last_match:
            last_working_date = parse_date_to_iso(labeled_last_match.group(1))

        explicit_last_match = re.search(r'(?:last working day|final separation record)\s*:?\s*(' + date_pattern + r')', text, re.IGNORECASE)
        if explicit_last_match:
            last_working_date = parse_date_to_iso(explicit_last_match.group(1))

        duration = calculate_duration(joining_date, last_working_date)
        duration_calculated = bool(duration)
        if not duration:
            dur_match = re.search(r'((?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+years?(?:\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+months?)?|approximately\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+years?)', text, re.IGNORECASE)
            if dur_match:
                duration = dur_match.group(1).strip()

        issue_match = re.search(r'(?:letter\s+)?(?:date|issued on|issue date|date of issue)\s*:?\s*(' + date_pattern + r')', text, re.IGNORECASE)
        letter_issue_date = parse_date_to_iso(issue_match.group(1)) if issue_match else None

        signatory_match = re.search(
            r'(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n\s*'
            r'((?:(?:HR|Human Resources|People Operations)\s+[A-Za-z ]+|[A-Z][a-z]+\s+(?:Manager|Director|Lead)))',
            text,
        )
        signatory_name = signatory_match.group(1).strip() if signatory_match else None
        signatory_designation = signatory_match.group(2).strip() if signatory_match else None

        emp_type = 'Full-time' if 'full-time' in lower_text else ('Part-time' if 'part-time' in lower_text else None)
        if not emp_type:
            type_match = re.search(r'Employment Type\s*:\s*([^\n]+)', text, re.IGNORECASE)
            emp_type = type_match.group(1).strip() if type_match else None

        scores = {
            'employee_name': confidence_score(emp_name, explicit=bool(name_match), corroborated=bool(emp_name and company_name)),
            'company_name': confidence_score(company_name, explicit=company_explicit, corroborated=bool(company_name and designation), fallback=company_fallback),
            'designation': confidence_score(designation, explicit=bool(desig_match), corroborated=bool(designation and (joining_date or last_working_date))),
            'employment_type': confidence_score(emp_type, explicit=emp_type is not None),
            'joining_date': confidence_score(joining_date, explicit=bool(date_range_match), normalized=bool(joining_date), corroborated=bool(last_working_date)),
            'last_working_date': confidence_score(last_working_date, explicit=bool(date_range_match), normalized=bool(last_working_date), corroborated=bool(joining_date)),
            'employment_duration': confidence_score(
                duration,
                explicit=not duration_calculated,
                normalized=duration_calculated,
                corroborated=duration_calculated,
            ),
            'letter_issue_date': confidence_score(letter_issue_date, explicit=bool(issue_match), normalized=bool(letter_issue_date)),
            'signatory_name': confidence_score(signatory_name, explicit=bool(signatory_match), corroborated=bool(signatory_designation)),
            'signatory_designation': confidence_score(signatory_designation, explicit=bool(signatory_match), corroborated=bool(signatory_name)),
        }

        data = ExperienceLetterData(
            document_type='Experience Certificate' if 'certificate' in lower_text else 'Experience Letter',
            employee_name=emp_name,
            company_name=company_name,
            designation=designation,
            employment_type=emp_type,
            joining_date=joining_date,
            last_working_date=last_working_date,
            employment_duration=duration,
            letter_issue_date=letter_issue_date,
            signatory_name=signatory_name,
            signatory_designation=signatory_designation,
            confidence_scores=scores,
            confidence_note='Evidence-based heuristic confidence from explicit wording, normalization, and corroborating fields; not a calibrated probability.',
            processing_method='Mock AI Mode (generic heuristic parsing)',
            validation_status='Pending Review'
        )
        return data, data.model_dump()
