import React, { useState } from 'react';
import { batchSummarizeWithEmails, comprehensiveAnalyzeEmail } from './api';
import './App.css'; // Reuse existing styles

const BatchSummaryReport = ({ emails, report, setReport, collapsedCategories, setCollapsedCategories }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzedEmails, setAnalyzedEmails] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const generateReport = async () => {
    if (emails.length === 0) {
      setError("No emails to summarize. Please fetch emails first in the 'Configuration & Inbox' page.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setReport(null);
    setAnalyzedEmails([]);
    setCalendarEvents([]);
    
    try {
      // First, analyze all emails for priority and calendar information
      const emailAnalysisPromises = emails.map(async (email) => {
        try {
          const analysis = await comprehensiveAnalyzeEmail(email.subject, email.body, email.from);
          return {
            ...email,
            priority: analysis.priority || { priority_score: 5, urgency_level: 'Medium', reasoning: 'No priority analysis available' },
            calendar_events: analysis.calendar_events || { has_events: false, events: [] },
            summary: analysis.summary || 'No summary available'
          };
        } catch (err) {
          console.error(`Failed to analyze email ${email.id}:`, err);
          return {
            ...email,
            priority: { priority_score: 5, urgency_level: 'Medium', reasoning: 'Analysis failed' },
            calendar_events: { has_events: false, events: [] },
            summary: 'Analysis failed'
          };
        }
      });
      
      const analyzed = await Promise.all(emailAnalysisPromises);
      
      // Sort emails by priority score (highest first)
      const sortedEmails = analyzed.sort((a, b) => {
        const scoreA = a.priority?.priority_score || 5;
        const scoreB = b.priority?.priority_score || 5;
        return scoreB - scoreA;
      });
      
      setAnalyzedEmails(sortedEmails);
      
      // Extract all calendar events
      const allEvents = [];
      sortedEmails.forEach(email => {
        if (email.calendar_events?.has_events && email.calendar_events.events?.length > 0) {
          email.calendar_events.events.forEach(event => {
            allEvents.push({
              ...event,
              emailId: email.id,
              emailSubject: email.subject,
              emailFrom: email.from
            });
          });
        }
      });
      
      setCalendarEvents(allEvents);
      
      // Generate enhanced batch summary report with priority and calendar data
      const data = await batchSummarizeWithEmails(sortedEmails);
      
      // Handle the new data structure with calendar_summary
      if (data.calendar_summary) {
        // If backend provides calendar_summary, use it to enhance our calendar events
        console.log('Calendar summary from backend:', data.calendar_summary);
        
        // Merge backend calendar events with our extracted events if needed
        if (data.calendar_summary.upcoming_meetings) {
          // Backend provides structured calendar summary
          setCalendarEvents(prevEvents => {
            const backendEvents = data.calendar_summary.upcoming_meetings.map(meeting => ({
              title: meeting.title,
              date: meeting.date,
              time: meeting.time,
              urgency: meeting.urgency,
              emailId: meeting.email_id,
              event_type: '会议',
              emailSubject: 'From batch analysis',
              emailFrom: 'Backend Analysis'
            }));
            
            // Combine with existing events, avoiding duplicates
            const combined = [...prevEvents];
            backendEvents.forEach(backendEvent => {
              const exists = combined.some(existing => 
                existing.title === backendEvent.title && 
                existing.date === backendEvent.date
              );
              if (!exists) {
                combined.push(backendEvent);
              }
            });
            
            return combined;
          });
        }
      }
      
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
          
          {/* Priority Sorted Emails Section */}
          {analyzedEmails.length > 0 && (
            <div className="priority-section">
              <h2 
                className="category-title collapsible" 
                onClick={() => toggleCategory('priority')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {collapsedCategories.has('priority') ? '▶' : '▼'} 📊 Priority Sorted Emails ({analyzedEmails.length})
              </h2>
              {!collapsedCategories.has('priority') && (
                <div className="priority-emails-list">
                  {analyzedEmails.map((email, index) => (
                    <div key={email.id} className="priority-email-item">
                      <div className="priority-email-header">
                        <div className="email-info">
                          <span className="priority-rank">#{index + 1}</span>
                          <span className="email-subject">{email.subject}</span>
                        </div>
                        <div className={`priority-badge priority-${email.priority?.urgency_level?.toLowerCase() || 'medium'}`}>
                          <span className="priority-score">{email.priority?.priority_score || 5}/10</span>
                          <span className="priority-label">{email.priority?.urgency_level || 'Medium'}</span>
                        </div>
                      </div>
                      <div className="priority-email-details">
                        <p><strong>From:</strong> {email.from}</p>
                        <p><strong>Priority Reasoning:</strong> {email.priority?.reasoning || 'No reasoning available'}</p>
                        <p><strong>Summary:</strong> {email.summary}</p>
                        {email.calendar_events?.has_events && (
                          <div className="email-calendar-indicator">
                            📅 <strong>Contains {email.calendar_events.events?.length || 0} calendar event(s)</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Calendar Events Section */}
          {calendarEvents.length > 0 && (
            <div className="calendar-section">
              <h2 
                className="category-title collapsible" 
                onClick={() => toggleCategory('calendar')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {collapsedCategories.has('calendar') ? '▶' : '▼'} 📅 Extracted Calendar Events ({calendarEvents.length})
              </h2>
              {!collapsedCategories.has('calendar') && (
                <div className="calendar-events-list">
                  {calendarEvents.map((event, index) => (
                    <div key={index} className="calendar-event-item">
                      <div className="event-header">
                        <h4>{event.title}</h4>
                        <span className={`event-type event-type-${event.event_type || 'meeting'}`}>
                          {event.event_type || 'meeting'}
                        </span>
                      </div>
                      <div className="event-details">
                        <p><strong>📅 Date:</strong> {event.date}</p>
                        <p><strong>🕐 Time:</strong> {event.time}</p>
                        {event.location && <p><strong>📍 Location:</strong> {event.location}</p>}
                        {event.description && <p><strong>📝 Description:</strong> {event.description}</p>}
                        {event.meeting_link && (
                          <p><strong>🔗 Meeting Link:</strong> 
                            <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                              {event.meeting_link}
                            </a>
                          </p>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <p><strong>👥 Attendees:</strong> {event.attendees.join(', ')}</p>
                        )}
                      </div>
                      <div className="event-source">
                        <small><strong>Source Email:</strong> {event.emailSubject} (from {event.emailFrom})</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Traditional Category Report */}
          {report && report.categories && report.categories.length > 0 && (
            <div className="traditional-report">
              <h2 
                className="category-title collapsible" 
                onClick={() => toggleCategory('traditional')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {collapsedCategories.has('traditional') ? '▶' : '▼'} 📋 Traditional Category Report
              </h2>
              {!collapsedCategories.has('traditional') && (
                <div className="report-content">
                  {report.categories.map((category, index) => (
                    <div key={index} className="category-section">
                      <h3 
                        className="category-subtitle collapsible" 
                        onClick={() => toggleCategory(`cat-${index}`)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        {collapsedCategories.has(`cat-${index}`) ? '▶' : '▼'} {category.name}
                      </h3>
                      {!collapsedCategories.has(`cat-${index}`) && (
                        category.emails && category.emails.length > 0 ? (
                          <ul className="category-email-list">
                            {category.emails.map((email, emailIndex) => (
                              <li key={emailIndex} className="category-email-item">
                                <div className="category-email-header">
                                  <span className="category-email-id">ID: {email.id}</span>
                                  <span className="category-email-from">From: {email.from}</span>
                                </div>
                                <h4 className="category-email-subject">{email.subject}</h4>
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
              )}
            </div>
          )}
          
          {!loading && !error && emails.length > 0 && !analyzedEmails.length && !report && (
            <p>No report generated yet. Click "Generate Batch Summary Report" to start.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default BatchSummaryReport;