import React from 'react';

const EmailDetail = ({ 
  selectedEmail, 
  lists, 
  selectedList, 
  analysisResult, 
  suggestedCategory, 
  isAnalyzing, 
  error,
  handleBackToList, 
  handleSummarize, 
  handleCategorize, 
  handleAddEmailToList,
  setSelectedList
}) => {
  if (!selectedEmail) {
    return null; // Or some placeholder if needed
  }

  return (
    <div className="email-detail-view">
      <button onClick={handleBackToList} className="action-btn back-btn">Back to List</button>
      
      <div className="email-detail-header">
        <h2>{selectedEmail.subject}</h2>
        <p><strong>From:</strong> {selectedEmail.from}</p>
      </div>
      
      <div className="ai-actions">
        <h3>AI Analysis & Actions</h3>
        <div className="action-group">
          <button 
            onClick={handleSummarize} 
            disabled={isAnalyzing} 
            className="action-btn summarize-btn"
          >
            {isAnalyzing ? 'Analyzing...' : 'Summarize'}
          </button>
          <button 
            onClick={handleCategorize} 
            disabled={isAnalyzing} 
            className="action-btn categorize-btn"
          >
            {isAnalyzing ? 'Analyzing...' : 'Suggest Category'}
          </button>
        </div>
        
        {analysisResult && (
          <div className="ai-result">
            <h4>Summary:</h4>
            <p>{analysisResult}</p>
          </div>
        )}
        
        {suggestedCategory && (
          <div className="ai-result">
            <h4>Suggested Category:</h4>
            <p><strong>{suggestedCategory}</strong></p>
          </div>
        )}
        
        <div className="action-group list-action">
          <select 
            value={selectedList} 
            onChange={e => setSelectedList(e.target.value)}
          >
            {lists.map(list => <option key={list} value={list}>{list}</option>)}
          </select>
          <button 
            onClick={handleAddEmailToList} 
            className="action-btn add-to-list-btn"
          >
            Add to List
          </button>
        </div>
      </div>
      
      {error && <p className="error-message">Error: {error}</p>}
      
      <div 
        className="email-body" 
        dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
      />
    </div>
  );
};

export default EmailDetail;