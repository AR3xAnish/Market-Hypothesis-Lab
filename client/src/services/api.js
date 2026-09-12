const BASE_URL = '/api';

export async function fetchDefaults() {
  const res = await fetch(`${BASE_URL}/questions/defaults`);
  if (!res.ok) throw new Error('Failed to fetch defaults');
  return res.json();
}

export async function clarifyQuestion(question) {
  const res = await fetch(`${BASE_URL}/questions/clarify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to clarify question');
  }
  return res.json();
}

export async function runExperiment(payload) {
  const res = await fetch(`${BASE_URL}/experiments/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || error.details || 'Failed to run experiment');
  }
  return res.json();
}

export async function fetchExperiments() {
  const res = await fetch(`${BASE_URL}/experiments`);
  if (!res.ok) throw new Error('Failed to fetch past experiments');
  return res.json();
}

export async function fetchExperimentById(id) {
  const res = await fetch(`${BASE_URL}/experiments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch experiment details');
  return res.json();
}
