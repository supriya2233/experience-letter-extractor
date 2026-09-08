# AI Experience Letter Information Extractor (IDP Platform)

An end-to-end **Intelligent Document Processing (IDP)** application demonstrating automated document ingestion, digital vs scanned document routing, text parsing (PyMuPDF / python-docx), image OCR (Tesseract), semantic AI information extraction, automated data quality validation, and Human-in-the-Loop (HITL) review.

---

## 🎯 Architecture & Processing Flow

```text
                  ┌────────────────────────────────────────┐
                  │          USER UPLOADS DOCUMENT         │
                  │       (PDF, DOCX, PNG, JPG, TXT)       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    FILE TYPE DETECTION    │
                        │ (MIME & Extension Routing)│
                        └─────────────┬─────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │     DIGITAL DOCUMENTS     │             │     SCANNED DOCUMENTS     │
   │      (PDF or DOCX)        │             │      (Images / Scans)     │
   └─────────────┬─────────────┘             └─────────────┬─────────────┘
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │   PyMuPDF / python-docx   │             │       Tesseract OCR       │
   │  (Direct Text Extraction) │             │ (Raster Pixels to Text)   │
   └─────────────┬─────────────┘             └─────────────┬─────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │     RAW EXTRACTED TEXT      │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │    AI EXTRACTION LAYER      │
                       │ ┌─────────────────────────┐ │
                       │ │ • Mock AI Mode (Rules)  │ │
                       │ │ • Anthropic Claude 3.5  │ │
                       │ │ • OpenAI GPT-4o         │ │
                       │ └─────────────────────────┘ │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │    STRUCTURED JSON SCHEMA   │
                       │(Employee, Dates, Signatory) │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │  DATA QUALITY & VALIDATION  │
                       │ (Mandatory Fields, Timeline)│
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │   HUMAN-IN-THE-LOOP (HITL)  │
                       │    (Edit & Approve in UI)   │
                       └─────────────────────────────┘
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python 3.10+** (tested on 3.12 / 3.14)
- **Node.js 18+** (v20+ recommended)
- *(Optional)* **Tesseract OCR** binary for image/scanned PDF OCR

---

### 1. Backend Setup (FastAPI)

```bash
cd backend

# 1. Activate virtual environment (or create: python -m venv venv)
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Configure AI Provider in .env
# By default, AI_PROVIDER=mock (works out of the box with zero API keys)
cp .env.example .env

# 4. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend API will be running at `http://localhost:8000`  
Swagger API Documentation: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js + Tailwind CSS)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Demo Sample Documents Included

The application comes with 3 preloaded real-world scenarios that can be tested with a single click:

| Sample | Scenario | Tested Characteristics |
| :--- | :--- | :--- |
| **Sample 1** | Standard Experience Letter | Complete corporate letter: employee name, designation, joining date, last working date, company, HR signatory. High confidence scores (98%+). |
| **Sample 2** | Alternative Style & Phrasing | Experience certificate with full-time phrasing, different terminology ("served in the role of", "between X and Y"). |
| **Sample 3** | Missing Required Information | Informal letter missing exact ISO start/end dates and signatory authority. Triggers automatic validation **WARNINGS** and 0% confidence badges on missing fields. |

Pre-generated test documents are also located in `backend/samples/`:
- `sample1_standard.pdf` (Digital PDF)
- `sample1_standard.docx` (Digital Microsoft Word document)
- `sample2_different_style.pdf` (Digital PDF)
- `sample3.txt` (Text format)

---

## 🤖 AI Provider Configuration

### 1. Mock AI Mode (Zero Config)
No API key required! Perfect for demonstrations, interviews, and automated testing.
- Derives structured extraction using semantic rules and regex heuristics.
- Accurately tags the response with `"processingMethod": "Mock AI Mode (simulated rules & semantics)"`.
- Computes estimated extraction confidence scores without fabricating real LLM log probabilities.

### 2. Real LLM Mode (Anthropic Claude or OpenAI GPT-4o)
To run real AI semantic extraction:
1. Open `backend/.env`
2. Add your API key:
   ```env
   # Choose provider: 'claude' or 'openai'
   AI_PROVIDER=claude
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # Or for OpenAI:
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-...
   ```
3. Restart the FastAPI server. The system will automatically route extraction through Claude 3.5 Sonnet or GPT-4o!

---

## 📋 Features & IDP Capabilities

- **Digital Document Parser**: Extracts selectable text directly from digital PDFs (via PyMuPDF) and Word documents (via python-docx).
- **OCR Fallback**: Automatically evaluates PDFs for low character density (scanned images). If scanned or an image file is uploaded, PyMuPDF renders pages to high-resolution raster buffers and passes them to Tesseract OCR.
- **Pipeline Stepper Visualizer**: Displays an 8-stage interactive visual stepper showing real-time execution duration and status for every stage (`Ingestion`, `Detection`, `Parser`, `OCR`, `AI Semantics`, `Extraction`, `Validation`, `Results`).
- **Human-in-the-Loop (HITL) Dashboard**:
  - Structured field editor with 🟢/🟡/🔴 confidence badges.
  - Interactive editing: modify any field and persist changes.
  - Approve button: records reviewer approval and stamps verification status.
  - JSON Export: one-click export of normalized JSON payload.
- **Data Quality Diagnostics**: Automated verification of mandatory fields, ISO 8601 date formatting, and chronological consistency (`joining_date < last_working_date`).

