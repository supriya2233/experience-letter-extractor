export interface ExperienceLetterData {
  document_type: string;
  employee_name: string | null;
  company_name: string | null;
  designation: string | null;
  employment_type: string | null;
  joining_date: string | null;
  last_working_date: string | null;
  employment_duration: string | null;
  letter_issue_date: string | null;
  signatory_name: string | null;
  signatory_designation: string | null;
  confidence_scores: Record<string, number>;
  confidence_note: string;
  processing_method: string;
  validation_status: string;
}

export interface FieldValidation {
  field: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  value: string | null;
}

export interface ValidationResult {
  is_valid: boolean;
  overall_status: 'PASS' | 'WARNING' | 'FAIL';
  passed_count: number;
  warning_count: number;
  fail_count: number;
  checks: FieldValidation[];
}

export interface PipelineStage {
  stage_id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  detail: string;
  duration_ms?: number;
}

export interface DocumentExtractionResult {
  filename: string;
  file_type: string;
  method: string;
  page_count: number;
  raw_text: string;
  is_scanned: boolean;
}

export interface ProcessingResponse {
  document: DocumentExtractionResult;
  extracted_data: ExperienceLetterData;
  validation: ValidationResult;
  pipeline_stages: PipelineStage[];
  is_mock: boolean;
  ai_provider: string;
  raw_ai_json: Record<string, any> | null;
  processing_time_ms: number;
}

export interface SampleDocument {
  id: string;
  title: string;
  filename: string;
  description: string;
  expected_type: string;
  raw_text: string;
}

