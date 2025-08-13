const API_BASE_URL = 'http://localhost:8000';

// --- Config Endpoints ---
export const getConfiguration = async () => {
  const response = await fetch(`${API_BASE_URL}/api/config`);
  if (!response.ok) throw new Error('Failed to fetch configuration');
  return response.json();
};

export const saveConfiguration = async (config) => {
  const response = await fetch(`${API_BASE_URL}/api/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('Failed to save configuration');
  return response.json();
};

// --- Email Endpoints ---
export const getEmails = async () => {
  const response = await fetch(`${API_BASE_URL}/api/emails`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch emails');
  }
  return response.json();
};

// --- AI Endpoints ---
export const summarizeEmail = async (subject, body) => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, body }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get summary');
  }
  return response.json();
};

export const categorizeEmail = async (subject, body) => {
    const response = await fetch(`${API_BASE_URL}/api/analyze/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get category suggestion');
    }
    return response.json();
};

// --- List Management Endpoints ---
export const getLists = async () => {
  const response = await fetch(`${API_BASE_URL}/api/lists`);
  if (!response.ok) throw new Error('Failed to fetch lists');
  return response.json();
};

export const createList = async (name) => {
  const response = await fetch(`${API_BASE_URL}/api/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create list');
  }
  return response.json();
};

export const addEmailToList = async (listName, emailId) => {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listName}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add email to list');
    }
    return response.json();
};
