from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field

class ExperienceLetterData(BaseModel):
    document_type: Optional[str] = 'Experience Letter'
    employee_name: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    employment_type: Optional[str] = None
    joining_date: Optional[str] = None
    last_working_date: Optional[str] = None
    employment_duration: Optional[str] = None
    letter_issue_date: Optional[str] = None
    signatory_name: Optional[str] = None
    signatory_designation: Optional[str] = None
    
    confidence_scores: Dict[str, int] = Field(default_factory=dict)
    confidence_note: str = 'Demo estimated confidence based on extraction heuristics.'
    processing_method: str = 'Mock AI Mode (simulated)'
    validation_status: str = 'Pending Review'

class FieldValidation(BaseModel):
    field: str
    label: str
    status: str
    message: str
    value: Optional[str] = None

class ValidationResult(BaseModel):
    is_valid: bool
    overall_status: str
    passed_count: int
    warning_count: int
    fail_count: int
    checks: List[FieldValidation]

class PipelineStage(BaseModel):
    stage_id: str
    name: str
    status: str
    detail: str
    duration_ms: Optional[float] = None

class DocumentExtractionResult(BaseModel):
    filename: str
    file_type: str
    method: str
    page_count: int
    raw_text: str
    is_scanned: bool = False

class ProcessingResponse(BaseModel):
    document: DocumentExtractionResult
    extracted_data: ExperienceLetterData
    validation: ValidationResult
    pipeline_stages: List[PipelineStage]
    is_mock: bool = True
    ai_provider: str = 'Mock Extractor'
    raw_ai_json: Optional[Dict[str, Any]] = None
    processing_time_ms: float = 0.0

class SampleDocument(BaseModel):
    id: str
    title: str
    filename: str
    description: str
    expected_type: str
    raw_text: str

class UpdateApprovalRequest(BaseModel):
    updated_data: ExperienceLetterData
    approval_notes: Optional[str] = None
