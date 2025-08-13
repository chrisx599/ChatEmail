import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import components
import Config from './components/Config';
import Mail from './components/Mail';
import BatchSummaryReport from './BatchSummaryReport';

// Separate component for navigation
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="app-navigation">
      <Link 
        to="/" 
        className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
      >
        📧 Configuration
      </Link>
      <Link 
        to="/mail" 
        className={location.pathname === '/mail' ? 'nav-link active' : 'nav-link'}
      >
        📬 Mail
      </Link>
      <Link 
        to="/report" 
        className={location.pathname === '/report' ? 'nav-link active' : 'nav-link'}
      >
        📊 Batch Report
      </Link>
    </nav>
  );
};

// This component has been replaced by separate Config and Mail components

// Main App component wrapped in Router
function App() {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [report, setReport] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  // Add state for batch analysis results
  const [analyzedEmails, setAnalyzedEmails] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route 
            path="/" 
            element={
              <Config 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                message={message}
                setMessage={setMessage}
              />
            } 
          />
          <Route 
            path="/mail" 
            element={
              <Mail 
                emails={emails}
                setEmails={setEmails}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                message={message}
                setMessage={setMessage}
                analyzedEmails={analyzedEmails}
                setAnalyzedEmails={setAnalyzedEmails}
                calendarEvents={calendarEvents}
                setCalendarEvents={setCalendarEvents}
              />
            } 
          />
          <Route 
            path="/report" 
            element={
              <BatchSummaryReport 
                emails={emails}
                isLoading={isLoading}
                error={error}
                message={message}
                setMessage={setMessage}
                report={report}
                setReport={setReport}
                collapsedCategories={collapsedCategories}
                setCollapsedCategories={setCollapsedCategories}
                analyzedEmails={analyzedEmails}
                setAnalyzedEmails={setAnalyzedEmails}
                calendarEvents={calendarEvents}
                setCalendarEvents={setCalendarEvents}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;