import { ProcessingResponse, SampleDocument } from '../types/api';
import { SAMPLES } from './samples';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function readError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = await response.json() as { detail?: string };
    return new Error(body.detail || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function processFile(file: File): Promise<ProcessingResponse> {
  const form = new FormData();
  form.append('file', file);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/process`, { method: 'POST', body: form });
  } catch {
    throw new Error('Backend connection failed. Start the FastAPI server and try again.');
  }
  if (!response.ok) throw await readError(response, 'Document processing failed.');
  return response.json() as Promise<ProcessingResponse>;
}

export async function processSample(sample: SampleDocument | string): Promise<ProcessingResponse> {
  const entry = typeof sample === 'string' ? SAMPLES.find(item => item.id === sample) : sample;
  if (!entry) throw new Error('Sample not found.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/samples/${entry.id}`, { method: 'POST' });
  } catch {
    throw new Error('Backend connection failed. Start the FastAPI server and try again.');
  }
  if (!response.ok) throw await readError(response, `Sample file could not be processed: ${entry.filename}`);
  return response.json() as Promise<ProcessingResponse>;
}

export { SAMPLES };
