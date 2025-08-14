import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { getEmails, summarizeEmail, comprehensiveAnalyzeEmail } from '../api';
import { emailCache, initializeCache } from '../services/cacheService';

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
  const mailContentRef = useRef(null);

  // 初始化缓存并加载缓存的邮件
  useEffect(() => {
    const initializeAndLoadCache = async () => {
      try {
        await initializeCache();
        
        // 如果没有邮件数据，尝试从缓存加载
        if (emails.length === 0) {
          const cachedEmails = await emailCache.getEmails();
          if (cachedEmails.length > 0) {
            setEmails(cachedEmails);
            setMessage('Emails loaded from cache.');
          }
        }
      } catch (error) {
        console.error('Failed to initialize cache or load cached emails:', error);
      }
    };
    
    initializeAndLoadCache();
  }, []); // 只在组件挂载时执行一次

  // 使用 useLayoutEffect 来稳定容器宽度，防止 iframe 内容变化影响布局
  useLayoutEffect(() => {
    if (mailContentRef.current) {
      const { width } = mailContentRef.current.getBoundingClientRect();
      // 设置固定宽度，防止内容变化时布局抖动
      mailContentRef.current.style.width = `${width}px`;
      mailContentRef.current.style.minWidth = `${width}px`;
      mailContentRef.current.style.maxWidth = `${width}px`;
    }
  }, [selectedEmail]); // 当选择的邮件变化时重新测量

  const handleFetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    
    try {
      const data = await getEmails();
      setEmails(data);
      setMessage('Emails fetched successfully.');
      
      // 缓存获取到的邮件数据
      await emailCache.saveEmails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
                {emails.sort((a, b) => parseInt(b.id) - parseInt(a.id)).map(email => (
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
          <div className="mail-content" ref={mailContentRef}>
            {selectedEmail ? (
              <div className="email-detail-view">
                <div className="email-detail-header">
                  <h2>{selectedEmail.subject}</h2>
                  <p><strong>From:</strong> {selectedEmail.from}</p>
                  {selectedEmail.to && <p><strong>To:</strong> {selectedEmail.to}</p>}
                  {selectedEmail.cc && <p><strong>CC:</strong> {selectedEmail.cc}</p>}
                  {selectedEmail.date && <p><strong>Date:</strong> {selectedEmail.date}</p>}
                  {selectedEmail.reply_to && <p><strong>Reply-To:</strong> {selectedEmail.reply_to}</p>}
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

                <div className="email-body">
                  <iframe
                    title="Email Content"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none';">
                          <style>
                            body {
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                              line-height: 1.6;
                              margin: 0;
                              padding: 16px;
                              background: white;
                              color: #333;
                            }
                            * {
                              max-width: 100% !important;
                            }
                            img {
                              max-width: 100% !important;
                              height: auto !important;
                            }
                            table {
                              width: 100% !important;
                              border-collapse: collapse;
                            }
                          </style>
                        </head>
                        <body>
                          ${selectedEmail.body}
                        </body>
                      </html>
                    `}
                    sandbox="allow-same-origin allow-popups"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      minHeight: '400px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                      display: 'block'
                    }}
                    onLoad={(e) => {
                      // Auto-resize iframe based on content with layout stability
                      const iframe = e.target;
                      // 使用 requestAnimationFrame 延迟高度调整，避免立即触发布局重排
                      requestAnimationFrame(() => {
                        try {
                          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                          const height = Math.max(
                            iframeDoc.body.scrollHeight,
                            iframeDoc.body.offsetHeight,
                            iframeDoc.documentElement.clientHeight,
                            iframeDoc.documentElement.scrollHeight,
                            iframeDoc.documentElement.offsetHeight
                          );
                          // 设置高度时不影响父容器宽度
                          iframe.style.height = Math.max(height + 20, 400) + 'px';
                          // 确保 iframe 不会影响父容器的宽度计算
                          iframe.style.contain = 'layout style';
                        } catch (err) {
                          // Fallback if cross-origin restrictions apply
                          iframe.style.height = '600px';
                        }
                      });
                    }}
                  />
                </div>
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