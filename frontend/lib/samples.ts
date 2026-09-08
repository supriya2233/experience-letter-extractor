import { SampleDocument } from '../types/api';

export const SAMPLES: SampleDocument[] = [
  { id: 'sample1-pdf', title: 'Standard Experience Letter (PDF)', filename: 'sample1_standard.pdf', description: 'A well-formatted PDF experience letter with all required fields present.', expected_type: 'Experience Letter', raw_text: '' },
  { id: 'sample1-docx', title: 'Standard Experience Letter (DOCX)', filename: 'sample1_standard.docx', description: 'The same complete experience letter in an editable document.', expected_type: 'Experience Letter', raw_text: '' },
  { id: 'sample2-pdf', title: 'Different Writing Style', filename: 'sample2_different_style.pdf', description: 'An experience certificate using alternate phrasing and layout.', expected_type: 'Experience Certificate', raw_text: '' },
  { id: 'sample3-txt', title: 'Missing Information', filename: 'sample3.txt', description: 'A letter with several fields absent, testing validation warnings and failures.', expected_type: 'Experience Letter (Incomplete)', raw_text: '' },
];
