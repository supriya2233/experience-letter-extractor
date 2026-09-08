import os
import time
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from ..types.schemas import (
    ProcessingResponse,
    DocumentExtractionResult,
    PipelineStage,
    SampleDocument,
    UpdateApprovalRequest
)
from ..document_processing import detect_document_type, extract_text_from_pdf, extract_text_from_docx
from ..ocr.tesseract_ocr import TesseractOCRProvider
from ..ai.factory import get_ai_provider
from ..validation.rules import validate_experience_data

router = APIRouter()
ocr_provider = TesseractOCRProvider()

def get_sample_texts():
    samples_dir = os.path.join(os.path.dirname(__file__), "..", "..", "samples")
    def read_s(fn):
        p = os.path.join(samples_dir, fn)
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                return f.read().strip()
        return ""
    return read_s("sample1.txt"), read_s("sample2.txt"), read_s("sample3.txt")

s1, s2, s3 = get_sample_texts()

SAMPLES = [
    SampleDocument(
        id="sample1",
        title="Sample 1 — Standard Experience Letter",
        filename="sample1_standard.pdf",
        description="Standard corporate format with full dates, designation, and signatory.",
        expected_type="Digital PDF / Text",
        raw_text=s1
    ),
    SampleDocument(
        id="sample2",
        title="Sample 2 — Different Writing Style",
        filename="sample2_different_style.pdf",
        description="Alternative certificate style, with full-time phrasing and different wording.",
        expected_type="Experience Certificate",
        raw_text=s2
    ),
    SampleDocument(
        id="sample3",
        title="Sample 3 — Missing Information",
        filename="sample3.txt",
        description="Informal letter missing exact dates and signatory, triggering validation warnings.",
        expected_type="Informal Letter (Gaps)",
        raw_text=s3
    )
]

@router.get("/samples", response_model=List[SampleDocument])
async def list_samples():
    return SAMPLES

@router.post("/process-sample/{sample_id}", response_model=ProcessingResponse)
async def process_sample(sample_id: str):
    sample = next((s for s in SAMPLES if s.id == sample_id), None)
    if not sample:
        raise HTTPException(status_code=404, detail="Sample document not found")
        
    start_time = time.time()
    
    stages = [
        PipelineStage(stage_id="upload", name="Document Loading", status="completed", detail=f"Sample '{sample.title}' loaded into pipeline.", duration_ms=5.0),
        PipelineStage(stage_id="detection", name="File Detection", status="completed", detail="Detected sample document content (Text format).", duration_ms=2.0),
        PipelineStage(stage_id="extraction", name="Text Extraction", status="completed", detail="Direct document text extraction completed.", duration_ms=8.0),
        PipelineStage(stage_id="ocr", name="OCR Evaluation", status="skipped", detail="Digital selectable text available. OCR bypassed.", duration_ms=1.0),
        PipelineStage(stage_id="ai_analysis", name="AI Semantic Understanding", status="completed", detail="Synthesizing document context and relationships.", duration_ms=15.0),
        PipelineStage(stage_id="extraction_struct", name="Structured Information Extraction", status="completed", detail="Mapped entities into structured schema.", duration_ms=12.0),
        PipelineStage(stage_id="validation", name="Data Quality Validation", status="completed", detail="Performed cross-field consistency and rule validations.", duration_ms=5.0),
        PipelineStage(stage_id="results", name="Structured Results Ready", status="completed", detail="Generated IDP inspection response.", duration_ms=2.0),
    ]
    
    ai_provider, is_mock, provider_name = get_ai_provider()
    extracted_data, raw_ai_json = ai_provider.extract(sample.raw_text)
    
    validation_res = validate_experience_data(extracted_data)
    extracted_data.validation_status = "Approved" if validation_res.is_valid else ("Requires Review" if validation_res.warning_count > 0 else "Invalid")
    
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    
    doc_res = DocumentExtractionResult(
        filename=sample.filename,
        file_type="sample_text",
        method="Direct Text Parser",
        page_count=1,
        raw_text=sample.raw_text,
        is_scanned=False
    )
    
    return ProcessingResponse(
        document=doc_res,
        extracted_data=extracted_data,
        validation=validation_res,
        pipeline_stages=stages,
        is_mock=is_mock,
        ai_provider=provider_name,
        raw_ai_json=raw_ai_json,
        processing_time_ms=elapsed_ms
    )

@router.post("/upload", response_model=ProcessingResponse)
async def process_upload(file: UploadFile = File(...)):
    start_time = time.time()
    file_bytes = await file.read()
    filename = file.filename or "unknown_file"
    
    # 1. Detection
    doc_category, mime_type = detect_document_type(filename, file_bytes)
    if doc_category == "unknown":
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{filename}'. Allowed types: PDF, DOCX, PNG, JPG, JPEG, TXT"
        )
        
    stages = [
        PipelineStage(stage_id="upload", name="Document Ingestion", status="completed", detail=f"Received file: {filename} ({len(file_bytes)} bytes)", duration_ms=10.0),
        PipelineStage(stage_id="detection", name="File Detection", status="completed", detail=f"Identified category {doc_category.upper()} (MIME: {mime_type})", duration_ms=5.0),
    ]
    
    extracted_text = ""
    method_desc = ""
    is_scanned = False
    page_count = 1
    ocr_stage_status = "skipped"
    ocr_detail = "Digital text selectable; OCR skipped."
    
    # 2. Digital Extraction or OCR
    if doc_category == "pdf":
        t0 = time.time()
        text, pages, scanned_flag = extract_text_from_pdf(file_bytes)
        page_count = pages
        if scanned_flag:
            is_scanned = True
            ocr_stage_status = "completed"
            ocr_detail = f"PDF is scanned (low character density). Running OCR across {pages} page(s)."
            ocr_text = ocr_provider.extract_text_from_scanned_pdf(file_bytes)
            extracted_text = ocr_text
            method_desc = "Scanned PDF -> Tesseract OCR"
        else:
            extracted_text = text
            method_desc = "Digital PDF Parser (PyMuPDF)"
            
        stages.append(PipelineStage(stage_id="extraction", name="PDF Parser", status="completed", detail=f"Extracted content from {pages} page(s).", duration_ms=round((time.time() - t0)*1000, 2)))
        stages.append(PipelineStage(stage_id="ocr", name="OCR Evaluation", status=ocr_stage_status, detail=ocr_detail, duration_ms=5.0))
        
    elif doc_category == "docx":
        t0 = time.time()
        text, para_count = extract_text_from_docx(file_bytes)
        extracted_text = text
        method_desc = "DOCX Parser (python-docx)"
        stages.append(PipelineStage(stage_id="extraction", name="DOCX Parser", status="completed", detail=f"Parsed {para_count} paragraphs and table cells.", duration_ms=round((time.time() - t0)*1000, 2)))
        stages.append(PipelineStage(stage_id="ocr", name="OCR Evaluation", status="skipped", detail="Digital DOCX document; OCR not required.", duration_ms=1.0))
        
    elif doc_category == "image":
        t0 = time.time()
        is_scanned = True
        extracted_text = ocr_provider.extract_text_from_image(file_bytes)
        method_desc = "Image -> Tesseract OCR"
        stages.append(PipelineStage(stage_id="extraction", name="Image Ingestion", status="completed", detail="Raster image loaded.", duration_ms=5.0))
        stages.append(PipelineStage(stage_id="ocr", name="Optical Character Recognition (OCR)", status="completed", detail="Extracted text from image pixels.", duration_ms=round((time.time() - t0)*1000, 2)))
        
    elif doc_category == "text":
        extracted_text = file_bytes.decode("utf-8", errors="replace")
        method_desc = "Plain Text Parser"
        stages.append(PipelineStage(stage_id="extraction", name="Plain Text Ingestion", status="completed", detail="Loaded raw text file.", duration_ms=2.0))
        stages.append(PipelineStage(stage_id="ocr", name="OCR Evaluation", status="skipped", detail="Plain text; OCR bypassed.", duration_ms=1.0))

    # 3. AI Extraction
    t0 = time.time()
    ai_provider, is_mock, provider_name = get_ai_provider()
    extracted_data, raw_ai_json = ai_provider.extract(extracted_text)
    stages.append(PipelineStage(stage_id="ai_analysis", name="AI Semantic Understanding", status="completed", detail=f"Processed with {provider_name}.", duration_ms=round((time.time() - t0)*1000, 2)))
    stages.append(PipelineStage(stage_id="extraction_struct", name="Structured Information Extraction", status="completed", detail="Extracted employee, company, role, timeline and signatory entities.", duration_ms=8.0))

    # 4. Validation
    validation_res = validate_experience_data(extracted_data)
    stages.append(PipelineStage(stage_id="validation", name="Data Quality Validation", status="completed", detail=f"Checks passed: {validation_res.passed_count}, warnings: {validation_res.warning_count}, fails: {validation_res.fail_count}.", duration_ms=4.0))
    stages.append(PipelineStage(stage_id="results", name="Structured Results Ready", status="completed", detail="Interactive review dashboard populated.", duration_ms=2.0))

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    
    doc_res = DocumentExtractionResult(
        filename=filename,
        file_type=doc_category,
        method=method_desc,
        page_count=page_count,
        raw_text=extracted_text,
        is_scanned=is_scanned
    )
    
    return ProcessingResponse(
        document=doc_res,
        extracted_data=extracted_data,
        validation=validation_res,
        pipeline_stages=stages,
        is_mock=is_mock,
        ai_provider=provider_name,
        raw_ai_json=raw_ai_json,
        processing_time_ms=elapsed_ms
    )

@router.post("/approve")
async def approve_record(req: UpdateApprovalRequest):
    data = req.updated_data
    validation_res = validate_experience_data(data)
    data.validation_status = "Approved by Reviewer"
    return JSONResponse(content={
        "status": "success",
        "message": "Experience letter record successfully approved and finalized.",
        "data": data.model_dump(),
        "validation": validation_res.model_dump(),
        "approval_notes": req.approval_notes
    })

