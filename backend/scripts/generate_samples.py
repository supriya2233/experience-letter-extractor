import os
import pymupdf as fitz
import docx

# Determine samples directory relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
SAMPLES_DIR = os.path.join(BACKEND_DIR, 'samples')
os.makedirs(SAMPLES_DIR, exist_ok=True)

sample1_text = '''TO WHOMSOEVER IT MAY CONCERN

This is to certify that Ms. Supriya Sanjeevakumar was employed with
ABC Technologies Pvt. Ltd. as a Software Engineer from January 10,
2023 to August 30, 2026.

During her tenure, she demonstrated strong technical skills and
professionalism.

We wish her success in all her future endeavors.

For ABC Technologies Pvt. Ltd.

Rahul Sharma
HR Manager

Date: September 1, 2026'''

sample2_text = '''EXPERIENCE CERTIFICATE

This is to confirm that Mr. Arjun Kumar worked with XYZ Solutions
Private Limited between March 15, 2021 and July 20, 2024.

He served in the role of Senior Software Developer.

Arjun was a full-time employee and contributed significantly to
multiple software development projects during his employment.

We appreciate his contribution and wish him the best.

Priya Menon
Human Resources Director

Issued on: July 25, 2024'''

sample3_text = '''TO WHOMSOEVER IT MAY CONCERN

This is to certify that Ananya Sharma was employed by Innovate Labs
as a Data Analyst.

She worked with the organization for approximately three years.

During her employment, she performed her responsibilities sincerely
and professionally.

We wish her success in her future career.

Innovate Labs'''

with open(os.path.join(SAMPLES_DIR, 'sample1.txt'), 'w', encoding='utf-8') as f:
    f.write(sample1_text)

with open(os.path.join(SAMPLES_DIR, 'sample2.txt'), 'w', encoding='utf-8') as f:
    f.write(sample2_text)

with open(os.path.join(SAMPLES_DIR, 'sample3.txt'), 'w', encoding='utf-8') as f:
    f.write(sample3_text)

# Generate sample1_standard.docx
doc = docx.Document()
for line in sample1_text.split('\n'):
    doc.add_paragraph(line)
doc.save(os.path.join(SAMPLES_DIR, 'sample1_standard.docx'))

# Generate sample1_standard.pdf
pdf_doc = fitz.open()
page = pdf_doc.new_page()
page.insert_text((50, 72), sample1_text, fontsize=11)
pdf_doc.save(os.path.join(SAMPLES_DIR, 'sample1_standard.pdf'))
pdf_doc.close()

# Generate sample2_different_style.pdf
pdf_doc2 = fitz.open()
page2 = pdf_doc2.new_page()
page2.insert_text((50, 72), sample2_text, fontsize=11)
pdf_doc2.save(os.path.join(SAMPLES_DIR, 'sample2_different_style.pdf'))
pdf_doc2.close()

print('Samples generated successfully in:', SAMPLES_DIR)
