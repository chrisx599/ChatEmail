const API_BASE_URL = 'http://localhost:8000';

export const getConfiguration = async () => {
  const response = await fetch(`${API_BASE_URL}/api/config`);
  if (!response.ok) {
    throw new Error('Failed to fetch configuration');
  }
  return response.json();
};

export const saveConfiguration = async (config) => {
  const response = await fetch(`${API_BASE_URL}/api/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error('Failed to save configuration');
  }
  return response.json();
};

export const getEmails = async () => {
  const response = await fetch(`${API_BASE_URL}/api/emails`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch emails');
  }
  return response.json();
};
