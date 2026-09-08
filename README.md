# AI Experience Letter Information Extractor

An intelligent document processing application that extracts structured career and employment data from experience letters, service certificates, and relieving letters (PDF, DOCX, Images).

Features multi-stage document processing (PDF parsing, OCR fallback, AI information extraction, and automated business rule validation) with confidence scoring and human-in-the-loop review.

---

## Architecture Overview

```
experience-letter-extractor/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── ai/               # AI Extraction Providers (Mock, Claude, OpenAI)
│   │   ├── api/              # Route handlers & endpoints
│   │   ├── document_processing/ # PDF, DOCX, Image parsers & detectors
│   │   ├── ocr/              # Tesseract OCR engine integration
│   │   ├── types/            # Pydantic data schemas
│   │   ├── validation/       # Field & date validation rules
│   │   └── main.py           # FastAPI entrypoint & pipeline orchestrator
│   ├── samples/              # Sample test letters (PDF, DOCX, TXT)
│   ├── scripts/              # Helper utilities (generate_samples.py)
│   ├── requirements.txt      # Python dependencies
│   ├── venv/                 # Virtual environment for backend
│   ├── .env.example          # Environment variables template
│   └── .env                  # Local backend configuration
│
├── frontend/                 # Next.js 14 + TypeScript frontend
│   ├── app/                  # App router (layout, globals.css, page)
│   ├── components/           # UI Components (UploadCard, PipelineVisualizer, ResultsDashboard, Header)
│   ├── types/                # TypeScript interface definitions
│   └── package.json          # Node dependencies & scripts
│
└── .vscode/                  # Workspace settings for Python environment
```

---

## Quick Start

### 1. Prerequisites
- **Python 3.10+** (tested with Python 3.12 / 3.14)
- **Node.js 18+** & `npm`

---

### 2. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. If the virtual environment does not exist, create it:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Configure environment:
   Copy `.env.example` to `.env`:
   ```bash
   # Works immediately with Mock AI mode (no API key needed)
   AI_PROVIDER=mock
   PORT=8000
   ```

   *(Optional)* To use real LLMs:
   ```env
   AI_PROVIDER=claude        # or 'openai'
   ANTHROPIC_API_KEY=sk-ant-...
   # or
   OPENAI_API_KEY=sk-...
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

---

### 3. Frontend Setup

1. Open another terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## Key Features

- **Document Ingestion**: Supports `.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg`, and `.tiff`.
- **Intelligent Fallback**: Digital PDF extraction via PyMuPDF with automatic scanned PDF detection and Tesseract OCR fallback.
- **Provider Agnostic**: Seamlessly switch between Mock mode (instant demo), Anthropic Claude 3.5 Sonnet, and OpenAI GPT-4o.
- **Rule-Based Validation**: Detects missing fields, validates date sequence (Start Date before End Date, Issue Date after Start Date), and assigns confidence scores.
- **Human Review & Approval**: Interactive dashboard allows editing extracted fields with real-time confidence indicator updates and approval tracking.
- **Preloaded Samples**: Quick testing with sample letters in multiple formats without needing your own files.
