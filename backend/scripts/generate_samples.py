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

sample7_pages = [
    '''NORTHSTAR DIGITAL SERVICES
EMPLOYEE RECORD SUMMARY
Document prepared: February 6, 2026
Employee ID issued: March 2, 2021
Last appraisal: December 15, 2025

This internal summary contains historical dates for reference.
The employee joined Northstar Digital Services on May 18, 2020.
''',
    '''EXPERIENCE LETTER

This is to certify that Ms. Kavya Menon was employed with
Northstar Digital Services as a Data Engineer from May 18, 2020
to November 29, 2025.

She was promoted to Senior Data Engineer on January 1, 2023.
She completed the Atlas migration project on June 30, 2024.
Her approved leave period was from August 5, 2024 to August 20, 2024.
''',
    '''During her employment, Kavya received recognition on March 10, 2022
and completed the annual security training on October 12, 2025.

We appreciate her contribution and wish her success.

For Northstar Digital Services

Rohan Mehta
People Operations Manager

Letter issued on December 4, 2025''',
]

sample8_pages = [
    '''ORBITAL SYSTEMS PRIVATE LIMITED
EMPLOYMENT CERTIFICATE

Reference number: OS-2026-041
Certificate created: April 15, 2026
''',
    '''This is to confirm that Mr. Elias Joseph worked with our organization
between February 3, 2019 and March 28, 2026 as a Cloud Consultant.

He originally joined the infrastructure team on February 3, 2019.
He moved to the cloud practice on July 1, 2021 and was promoted on
January 1, 2024. His project assignment ended on March 15, 2026,
but his last working day was March 28, 2026.
''',
    '''Additional timeline details:
Security certification: May 9, 2020
Performance review: November 22, 2022
Client appreciation: August 14, 2025
Final asset return: April 2, 2026

Elias was a full-time employee.

Issued on: April 15, 2026

Meera Rao
Human Resources Director''',
]

case_pages = {
    'sample9_multiple_periods.pdf': [
        'EMPLOYMENT HISTORY\nEmployee: Nisha Verma\n\nNisha worked at Meridian Labs from January 6, 2018 to June 30, 2020.\nShe rejoined Meridian Labs between September 1, 2020 and December 18, 2024.\nIssued on: January 5, 2025\n\nAmit Roy\nHR Manager',
    ],
    'sample10_current_employee.pdf': [
        'CURRENT EMPLOYMENT LETTER\n\nThis is to confirm that Rahul Das joined BluePeak Systems on March 4, 2022.\nHe is currently employed as a Platform Engineer and remains an active full-time employee.\nLetter date: August 12, 2026\n\nNeha Singh\nPeople Operations Manager',
    ],
    'sample11_conflicting_dates.pdf': [
        'EXPERIENCE LETTER\n\nThis certifies that Meera Thomas was employed with HarborWorks Ltd from April 10, 2021 to April 10, 2024.\nThe final separation record says last working day: March 28, 2024.\nIssued on: May 2, 2024\n\nVikram Rao\nHR Manager',
    ],
    'sample12_promotion_history.pdf': [
        'EXPERIENCE CERTIFICATE\n\nMr. Omar Khan joined Vertex Consulting on February 14, 2019 as an Associate Consultant.\nHe was promoted to Consultant on July 1, 2021 and to Senior Consultant on October 1, 2023.\nHis employment ended on January 31, 2026.\nIssued on: February 6, 2026\n\nSara Ali\nHuman Resources Director',
    ],
    'sample13_labeled_fields.pdf': [
        'EMPLOYMENT VERIFICATION\n\nEmployee Name: Elena Garcia\nCompany Name: Redwood Operations Inc.\nDesignation: Operations Specialist\nDate Joined: 15-Feb-2020\nLast Working Day: 31-Jan-2025\nLetter Issue Date: 10-Feb-2025\nEmployment Type: Full-time\n\nSigned by\nCarlos Mendez\nHR Manager',
    ],
    'sample14_header_footer_noise.pdf': [
        'CONFIDENTIAL - PAGE 1 OF 2\nOrchid Finance Group\n\nThis is to certify that Ms. Tara Rao was employed by Orchid Finance Group as a Finance Analyst from June 2, 2020 to May 31, 2025.\n\nCONFIDENTIAL - Generated November 20, 2025',
        'CONFIDENTIAL - PAGE 2 OF 2\nOrchid Finance Group\n\nTara completed a review on March 4, 2024 and a compliance course on September 9, 2024.\n\nIssued on: June 6, 2025\n\nDev Malik\nCompliance Manager\nCONFIDENTIAL - Generated November 20, 2025',
    ],
    'sample15_multiple_companies.pdf': [
        'CAREER CERTIFICATE\n\nMr. Joseph Lee worked for Alpha Retail from January 2017 to December 2019.\nHe then worked with Beacon Commerce as a Product Manager from January 6, 2020 to March 15, 2025.\nThis certificate is issued by Beacon Commerce.\n\nIssued on: March 20, 2025\n\nLinda Wu\nHR Director',
    ],
    'sample16_missing_dates.pdf': [
        'EXPERIENCE LETTER\n\nThis is to certify that Ms. Farah Noor was employed with Silverline Health as a Support Specialist.\nShe worked with the organization for several years and was a full-time employee.\n\nSilverline Health',
    ],
    'sample17_locale_dates.pdf': [
        'EXPERIENCE CERTIFICATE\n\nThis confirms that Mr. Marco Rossi worked with Alpine Systems as a QA Engineer from 05/02/2021 to 31/01/2025.\nDate of issue: 05/02/2025\n\nGiulia Bianchi\nHR Manager',
    ],
    'sample18_duplicate_headers.pdf': [
        'ACME TECHNOLOGIES - EXPERIENCE LETTER\nPAGE 1\n\nACME TECHNOLOGIES - EXPERIENCE LETTER\nThis certifies that Ms. Isha Patel was employed with Acme Technologies as a Software Tester from July 7, 2022 to February 28, 2026.',
        'ACME TECHNOLOGIES - EXPERIENCE LETTER\nPAGE 2\n\nACME TECHNOLOGIES - EXPERIENCE LETTER\nShe completed an audit on January 11, 2025.\nIssued on: March 3, 2026\n\nArun Shah\nHR Lead',
    ],
}

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

def create_multipage_pdf(filename, pages):
    document = fitz.open()
    for page_text in pages:
        page = document.new_page()
        page.insert_textbox((54, 54, 558, 738), page_text, fontsize=11, lineheight=1.35)
    document.save(os.path.join(SAMPLES_DIR, filename))
    document.close()

create_multipage_pdf('sample7_many_dates.pdf', sample7_pages)
create_multipage_pdf('sample8_many_dates_certificate.pdf', sample8_pages)
for filename, pages in case_pages.items():
    create_multipage_pdf(filename, pages)

print('Samples generated successfully in:', SAMPLES_DIR)
