import React, { useState } from 'react';
import { batchSummarizeWithEmails } from './api';
import './App.css'; // Reuse existing styles

const BatchSummaryReport = ({ emails, report, setReport, collapsedCategories, setCollapsedCategories }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    if (emails.length === 0) {
      setError("No emails to summarize. Please fetch emails first in the 'Configuration & Inbox' page.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setReport(null);
    
    try {
      // Send the emails data to the backend
      const data = await batchSummarizeWithEmails(emails);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryIndex) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryIndex)) {
      newCollapsed.delete(categoryIndex);
    } else {
      newCollapsed.add(categoryIndex);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Batch Summary Report</h1>
      </header>
      <main className="container">
        <div className="report-section">
          <div className="report-header">
            <h2>Report</h2>
            <button onClick={generateReport} disabled={loading || emails.length === 0} className="action-btn fetch-btn">
              {loading ? 'Generating Report...' : 'Generate Batch Summary Report'}
            </button>
          </div>
          
          {error && <p className="error-message">Error: {error}</p>}
          
          {loading && !report && (
            <p>Generating batch summary report...</p>
          )}
          
          {emails.length === 0 && !loading && !report && (
            <p>Please fetch emails first in the 'Configuration & Inbox' page.</p>
          )}
          
          {report && report.categories && report.categories.length > 0 ? (
            <div className="report-content">
              {report.categories.map((category, index) => (
                <div key={index} className="category-section">
                  <h2 
                    className="category-title collapsible" 
                    onClick={() => toggleCategory(index)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {collapsedCategories.has(index) ? '▶' : '▼'} {category.name}
                  </h2>
                  {!collapsedCategories.has(index) && (
                    category.emails && category.emails.length > 0 ? (
                      <ul className="category-email-list">
                        {category.emails.map((email, emailIndex) => (
                          <li key={emailIndex} className="category-email-item">
                            <div className="category-email-header">
                              <span className="category-email-id">ID: {email.id}</span>
                              <span className="category-email-from">From: {email.from}</span>
                            </div>
                            <h3 className="category-email-subject">{email.subject}</h3>
                            <p className="category-email-summary">{email.summary}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No emails in this category.</p>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            !loading && !error && emails.length > 0 && <p>No report generated yet. Click "Generate Batch Summary Report" to start.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default BatchSummaryReport;