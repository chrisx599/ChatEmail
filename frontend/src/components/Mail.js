import React, { useState, useEffect, useCallback } from 'react';
import { getEmails, summarizeEmail, comprehensiveAnalyzeEmail } from '../api';

const Mail = ({ 
  emails, 
  setEmails, 
  isLoading, 
  setIsLoading, 
  error, 
  setError, 
  message, 
  setMessage 
}) => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [emailAnalysisCache, setEmailAnalysisCache] = useState({});

  const handleFetchEmails = () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    getEmails()
      .then(data => {
        setEmails(data);
        setMessage('Emails fetched successfully.');
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setAnalysisResult(''); // Clear previous analysis
    setError('');
  };

  // 使用useCallback来优化分析函数
  const analyzeEmail = useCallback(async (email) => {
    if (!email || emailAnalysisCache[email.id]) return;
    
    try {
      const data = await comprehensiveAnalyzeEmail(email.subject, email.body, email.from);
      setEmailAnalysisCache(prevCache => ({
        ...prevCache,
        [email.id]: {
          priority: data.priority,
          calendar_events: data.calendar_events
        }
      }));
    } catch (err) {
      console.error('Failed to analyze email:', err);
    }
  }, [emailAnalysisCache]);

  // 使用useEffect来处理邮件分析，避免在点击时立即更新状态
  useEffect(() => {
    if (selectedEmail) {
      analyzeEmail(selectedEmail);
    }
  }, [selectedEmail, analyzeEmail]);

  const handleSummarize = () => {
    if (!selectedEmail) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult('');
    summarizeEmail(selectedEmail.subject, selectedEmail.body)
      .then(data => setAnalysisResult(data.summary))
      .catch(err => setError(err.message))
      .finally(() => setIsAnalyzing(false));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mail</h1>
      </header>
      <main className="container">
        <div className="mail-layout">
          {/* Left Panel - Email List */}
          <div className="mail-sidebar">
            <div className="mail-toolbar">
              <button 
                onClick={handleFetchEmails} 
                disabled={isLoading} 
                className="action-btn fetch-btn"
              >
                {isLoading ? 'Fetching...' : 'Fetch Emails'}
              </button>
            </div>
            
            {error && <p className="error-message">Error: {error}</p>}
            {message && <p className="success-message">{message}</p>}
            
            <div className="email-list-container">
              <ul className="email-list">
                {emails.map(email => (
                  <li 
                    key={email.id} 
                    className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                    onClick={() => handleSelectEmail(email)}
                  >
                    <div className="email-header">
                      <div className="email-subject">{email.subject}</div>
                      {emailAnalysisCache[email.id]?.priority && (
                        <div className={`priority-badge priority-${emailAnalysisCache[email.id].priority.urgency_level}`}>
                          <span className="priority-score">{emailAnalysisCache[email.id].priority.priority_score}/10</span>
                          <span className="priority-label">{emailAnalysisCache[email.id].priority.urgency_level}</span>
                        </div>
                      )}
                    </div>
                    <div className="email-from">From: {email.from}</div>
                    {emailAnalysisCache[email.id]?.priority && (
                      <div className="email-priority-info">
                        <span className="priority-reason">{emailAnalysisCache[email.id].priority.reasoning}</span>
                      </div>
                    )}
                    {emailAnalysisCache[email.id]?.calendar_events && emailAnalysisCache[email.id].calendar_events.events && emailAnalysisCache[email.id].calendar_events.events.length > 0 && (
                      <div className="email-calendar-indicator">
                        📅 {emailAnalysisCache[email.id].calendar_events.events.length} event(s)
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {emails.length === 0 && !isLoading && (
                <div className="empty-state">
                  <p>No emails to display.</p>
                  <p>Click "Fetch Emails" to start.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Panel - Email Detail */}
          <div className="mail-content">
            {selectedEmail ? (
              <div className="email-detail-view">
                <div className="email-detail-header">
                  <h2>{selectedEmail.subject}</h2>
                  <p><strong>From:</strong> {selectedEmail.from}</p>
                </div>
                
                <div className="ai-actions">
                  <h3>AI Analysis</h3>
                  <button 
                    onClick={handleSummarize} 
                    disabled={isAnalyzing} 
                    className="action-btn summarize-btn"
                  >
                    {isAnalyzing ? 'Summarizing...' : 'Summarize Email'}
                  </button>
                  
                  {error && <p className="error-message">Error: {error}</p>}
                  {analysisResult && (
                    <div className="ai-result">
                      <h4>Summary:</h4>
                      <p>{analysisResult}</p>
                    </div>
                  )}
                  
                  {/* Priority Information */}
                  {emailAnalysisCache[selectedEmail.id]?.priority && (
                    <div className="ai-result priority-analysis">
                      <h4>Priority Analysis:</h4>
                      <div className="priority-details">
                        <div className={`priority-badge-large priority-${emailAnalysisCache[selectedEmail.id].priority.urgency_level}`}>
                          <span className="priority-score-large">{emailAnalysisCache[selectedEmail.id].priority.priority_score}/10</span>
                          <span className="priority-label-large">{emailAnalysisCache[selectedEmail.id].priority.urgency_level}</span>
                        </div>
                        <div className="priority-info">
                          <p><strong>Reasoning:</strong> {emailAnalysisCache[selectedEmail.id].priority.reasoning}</p>
                          <p><strong>Suggested Action:</strong> {emailAnalysisCache[selectedEmail.id].priority.suggested_action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Calendar Events */}
                  {emailAnalysisCache[selectedEmail.id]?.calendar_events && emailAnalysisCache[selectedEmail.id].calendar_events.events && emailAnalysisCache[selectedEmail.id].calendar_events.events.length > 0 && (
                    <div className="ai-result calendar-events">
                      <h4>Calendar Events Found:</h4>
                      {emailAnalysisCache[selectedEmail.id].calendar_events.events.map((event, index) => (
                        <div key={index} className="calendar-event">
                          <div className="event-header">
                            <h5>{event.title}</h5>
                            <span className={`event-type event-type-${event.type}`}>{event.type}</span>
                          </div>
                          <div className="event-details">
                            <p><strong>Date:</strong> {event.date}</p>
                            <p><strong>Time:</strong> {event.time}</p>
                            {event.location && <p><strong>Location:</strong> {event.location}</p>}
                            {event.description && <p><strong>Description:</strong> {event.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="email-body" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
              </div>
            ) : (
              <div className="empty-detail-state">
                <div className="empty-detail-content">
                  <h3>Select an email to view details</h3>
                  <p>Choose an email from the list on the left to see its content and AI analysis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mail;