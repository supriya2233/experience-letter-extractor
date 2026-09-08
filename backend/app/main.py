import io
import os
import time
import tempfile
import traceback
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from .types.schemas import (
    ProcessingResponse, DocumentExtractionResult,
    PipelineStage, SampleDocument, UpdateApprovalRequest
)
from .document_processing.detector import detect_document_type
from .document_processing.pdf_parser import extract_text_from_pdf
from .document_processing.docx_parser import extract_text_from_docx
from .ai.factory import get_ai_provider
from .validation.rules import validate_experience_data

app = FastAPI(title="Experience Letter Extractor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Sample documents
# ---------------------------------------------------------------------------
SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "samples"))

SAMPLE_REGISTRY = [
    SampleDocument(
        id="sample1-pdf",
        title="Standard Experience Letter (PDF)",
        filename="sample1_standard.pdf",
        description="A well-formatted experience letter with all required fields present.",
        expected_type="Experience Letter",
        raw_text=""
    ),
    SampleDocument(
        id="sample1-docx",
        title="Standard Experience Letter (DOCX)",
        filename="sample1_standard.docx",
        description="The same complete experience letter in an editable document.",
        expected_type="Experience Letter",
        raw_text=""
    ),
    SampleDocument(
        id="sample2-pdf",
        title="Different Writing Style",
        filename="sample2_different_style.pdf",
        description="An experience certificate using alternate phrasing and layout.",
        expected_type="Experience Certificate",
        raw_text=""
    ),
    SampleDocument(
        id="sample3-txt",
        title="Missing Information",
        filename="sample3.txt",
        description="A letter with several fields absent — tests validation warnings/fails.",
        expected_type="Experience Letter (Incomplete)",
        raw_text=""
    ),
    SampleDocument(
        id="sample4-pdf",
        title="Alternate Wording Certificate",
        filename="sample4_alternate.pdf",
        description="Uses 'we certify', 'employed from', and 'held the position of' phrasing.",
        expected_type="Experience Certificate",
        raw_text=""
    ),
    SampleDocument(
        id="sample5-pdf",
        title="Incomplete PDF Letter",
        filename="sample5_incomplete.pdf",
        description="A PDF with real employee, company, role, and duration but missing dates and signatory.",
        expected_type="Experience Letter (Incomplete)",
        raw_text=""
    ),
    SampleDocument(
        id="sample6-pdf",
        title="Employment Certificate",
        filename="sample6_certificate.pdf",
        description="A complete certificate using 'worked with our organization' and 'served as' wording.",
        expected_type="Experience Certificate",
        raw_text=""
    ),
]

def _load_sample_bytes(filename: str) -> bytes:
    path = os.path.join(SAMPLES_DIR, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f.read()
    return b""

def _build_pipeline_stages(
    detection_method: str,
    doc_type: str,
    is_scanned: bool,
    ai_provider_name: str,
    stage_times: dict,
) -> list:
    ocr_status = "skipped" if not is_scanned else "completed"
    ocr_detail = "Digital document — OCR not required." if not is_scanned else "Scanned PDF detected, OCR applied."
    return [
        PipelineStage(stage_id="upload", name="Upload & Validation", status="completed",
                      detail="File received and validated.", duration_ms=stage_times.get("upload")),
        PipelineStage(stage_id="detection", name="Document Detection", status="completed",
                      detail=f"Detected as {doc_type} via {detection_method}.", duration_ms=stage_times.get("detection")),
        PipelineStage(stage_id="extraction", name="Text Extraction", status="completed",
                      detail=f"Text extracted using {detection_method} parser.", duration_ms=stage_times.get("extraction")),
        PipelineStage(stage_id="ocr", name="OCR Processing", status=ocr_status,
                      detail=ocr_detail, duration_ms=stage_times.get("ocr")),
        PipelineStage(stage_id="ai_analysis", name="AI Analysis", status="completed",
                      detail=f"Processed by {ai_provider_name}.", duration_ms=stage_times.get("ai")),
        PipelineStage(stage_id="validation", name="Validation", status="completed",
                      detail="Field validation and confidence checks applied.", duration_ms=stage_times.get("validation")),
        PipelineStage(stage_id="results", name="Results Ready", status="completed",
                      detail="Extraction complete. Review your results.", duration_ms=None),
    ]

def process_document(file_bytes: bytes, filename: str) -> ProcessingResponse:
    t0 = time.time()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 20 MB allowed.")

    doc_type, _ = detect_document_type(filename, file_bytes)
    if doc_type == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, DOCX, PNG, or JPEG.")

    is_scanned = False
    page_count = 1
    if doc_type == "pdf":
        raw_text, page_count, is_scanned = extract_text_from_pdf(file_bytes)
        method = "pdf_parser"
    elif doc_type == "docx":
        raw_text = extract_text_from_docx(file_bytes)
        method = "docx_parser"
    elif doc_type == "text":
        raw_text = file_bytes.decode("utf-8", errors="replace")
        method = "text_reader"
    elif doc_type == "image":
        try:
            import pytesseract
            from PIL import Image
            image = Image.open(io.BytesIO(file_bytes))
            raw_text = pytesseract.image_to_string(image)
            method = "tesseract_ocr"
            is_scanned = True
        except ImportError:
            raise HTTPException(status_code=501, detail="Tesseract/Pillow not installed. Cannot process image files.")
        except (FileNotFoundError, pytesseract.TesseractNotFoundError):
            raise HTTPException(status_code=501, detail="Tesseract OCR is not installed or not available on PATH. Install Tesseract and restart the backend.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported document type.")

    stage_times = {
        "upload": round((time.time() - t0) * 1000, 1),
        "detection": 0.0,
        "extraction": round((time.time() - t0) * 1000, 1),
    }

    ai_provider, is_mock, ai_name = get_ai_provider()

    t_ai = time.time()
    extracted_data, raw_ai_json = ai_provider.extract(raw_text)
    stage_times["ai"] = round((time.time() - t_ai) * 1000, 1)
    stage_times["ocr"] = 0.0

    t_val = time.time()
    validation = validate_experience_data(extracted_data)
    stage_times["validation"] = round((time.time() - t_val) * 1000, 1)

    doc_result = DocumentExtractionResult(
        filename=filename,
        file_type=doc_type,
        method=method,
        page_count=page_count,
        raw_text=raw_text,
        is_scanned=is_scanned,
    )

    pipeline = _build_pipeline_stages(
        detection_method=method,
        doc_type=doc_type,
        is_scanned=is_scanned,
        ai_provider_name=ai_name,
        stage_times=stage_times,
    )

    return ProcessingResponse(
        document=doc_result,
        extracted_data=extracted_data,
        validation=validation,
        pipeline_stages=pipeline,
        is_mock=is_mock,
        ai_provider=ai_name,
        raw_ai_json=raw_ai_json,
        processing_time_ms=round((time.time() - t0) * 1000, 1),
    )

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    _, is_mock, ai_name = get_ai_provider()
    return {"status": "ok", "ai_provider": ai_name, "mock_mode": is_mock}

# ---------------------------------------------------------------------------
# Sample endpoints
# ---------------------------------------------------------------------------
@app.get("/api/samples")
async def list_samples():
    result = []
    for s in SAMPLE_REGISTRY:
        sample_bytes = _load_sample_bytes(s.filename)
        preview = sample_bytes.decode("utf-8", errors="replace") if sample_bytes else ""
        result.append({**s.model_dump(), "raw_text": preview[:200] + "..." if len(preview) > 200 else preview})
    return result

@app.post("/api/samples/{sample_id}")
async def process_sample(sample_id: str):
    match = next((s for s in SAMPLE_REGISTRY if s.id == sample_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found.")
    file_bytes = _load_sample_bytes(match.filename)
    if not file_bytes:
        raise HTTPException(status_code=500, detail=f"Sample file '{match.filename}' could not be read.")
    return process_document(file_bytes, match.filename)

# ---------------------------------------------------------------------------
# File upload + process
# ---------------------------------------------------------------------------
@app.post("/api/process")
async def process_file(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        filename = file.filename or "upload"
        return process_document(file_bytes, filename)

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

# ---------------------------------------------------------------------------
# Approval endpoint
# ---------------------------------------------------------------------------
@app.post("/api/approve")
async def approve_extraction(request: UpdateApprovalRequest):
    updated = request.updated_data
    validation = validate_experience_data(updated)
    return {
        "status": "approved",
        "updated_data": updated.model_dump(),
        "validation": validation.model_dump(),
        "notes": request.approval_notes or "",
    }
