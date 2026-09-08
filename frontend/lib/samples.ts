import { SampleDocument } from '../types/api';

export const SAMPLES: SampleDocument[] = [
  { id: 'sample1-pdf', title: 'Standard Experience Letter (PDF)', filename: 'sample1_standard.pdf', description: 'A well-formatted PDF experience letter with all required fields present.', expected_type: 'Experience Letter', raw_text: '' },
  { id: 'sample1-docx', title: 'Standard Experience Letter (DOCX)', filename: 'sample1_standard.docx', description: 'The same complete experience letter in an editable document.', expected_type: 'Experience Letter', raw_text: '' },
  { id: 'sample2-pdf', title: 'Different Writing Style', filename: 'sample2_different_style.pdf', description: 'An experience certificate using alternate phrasing and layout.', expected_type: 'Experience Certificate', raw_text: '' },
  { id: 'sample3-txt', title: 'Missing Information', filename: 'sample3.txt', description: 'A letter with several fields absent, testing validation warnings and failures.', expected_type: 'Experience Letter (Incomplete)', raw_text: '' },
  { id: 'sample4-pdf', title: 'Alternate Wording Certificate', filename: 'sample4_alternate.pdf', description: "Uses 'we certify', 'employed from', and 'held the position of' phrasing.", expected_type: 'Experience Certificate', raw_text: '' },
  { id: 'sample5-pdf', title: 'Incomplete PDF Letter', filename: 'sample5_incomplete.pdf', description: 'A PDF with real employee, company, role, and duration but missing dates and signatory.', expected_type: 'Experience Letter (Incomplete)', raw_text: '' },
  { id: 'sample6-pdf', title: 'Employment Certificate', filename: 'sample6_certificate.pdf', description: "A complete certificate using 'worked with our organization' and 'served as' wording.", expected_type: 'Experience Certificate', raw_text: '' },
  { id: 'sample7-many-dates', title: 'Many Dates Experience Letter', filename: 'sample7_many_dates.pdf', description: 'A three-page letter with appraisal, promotion, project, leave, and issue dates.', expected_type: 'Experience Letter', raw_text: '' },
  { id: 'sample8-many-dates-certificate', title: 'Many Dates Employment Certificate', filename: 'sample8_many_dates_certificate.pdf', description: 'A three-page certificate with multiple historical and employment dates.', expected_type: 'Experience Certificate', raw_text: '' },
];
