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

export const summarizeEmail = async (subject, body) => {
    const response = await fetch(`${API_BASE_URL}/api/analyze/summarize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, body }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get summary');
    }
    return response.json();
};

export const batchSummarizeEmails = async () => {
    const response = await fetch(`${API_BASE_URL}/api/batch-summarize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        // Try to get error details from the response
        let errorDetail = 'Failed to get batch summary';
        try {
            const error = await response.json();
            errorDetail = error.detail || errorDetail;
        } catch (e) {
            // If parsing JSON fails, use the status text
            errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
    }
    return response.json();
};

export const batchSummarizeWithEmails = async (emails) => {
    const response = await fetch(`${API_BASE_URL}/api/batch-summarize-with-data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
    });
    if (!response.ok) {
        // Try to get error details from the response
        let errorDetail = 'Failed to get batch summary';
        try {
            const error = await response.json();
            errorDetail = error.detail || errorDetail;
        } catch (e) {
            // If parsing JSON fails, use the status text
            errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
    }
    return response.json();
};

export const comprehensiveAnalyzeEmail = async (subject, body, fromAddr) => {
    const response = await fetch(`${API_BASE_URL}/api/analyze/comprehensive`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            subject, 
            body, 
            from: fromAddr 
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get comprehensive analysis');
    }
    return response.json();
};