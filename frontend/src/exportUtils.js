// Export utilities for BatchSummaryReport
// Supports multiple export formats: PDF, HTML, JSON, CSV, TXT

/**
 * Export formats configuration
 */
export const EXPORT_FORMATS = {
  PDF: {
    id: 'pdf',
    name: 'PDF Document',
    description: '完整格式化的PDF文档，包含所有样式和布局',
    icon: '📄',
    mimeType: 'application/pdf'
  },
  HTML: {
    id: 'html',
    name: 'HTML Document',
    description: '可在浏览器中查看的HTML文档，保持原有样式',
    icon: '🌐',
    mimeType: 'text/html'
  },
  JSON: {
    id: 'json',
    name: 'JSON Data',
    description: '结构化的JSON数据，便于程序处理',
    icon: '📊',
    mimeType: 'application/json'
  },
  CSV: {
    id: 'csv',
    name: 'CSV Spreadsheet',
    description: 'Excel兼容的CSV表格，适合数据分析',
    icon: '📈',
    mimeType: 'text/csv'
  },
  TXT: {
    id: 'txt',
    name: 'Plain Text',
    description: '纯文本格式，兼容性最好',
    icon: '📝',
    mimeType: 'text/plain'
  }
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (format, prefix = 'email_report') => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_');
  return `${prefix}_${timestamp}.${format}`;
};

/**
 * Export to JSON format
 */
export const exportToJSON = (analyzedEmails, calendarEvents, report) => {
  const data = {
    exportInfo: {
      timestamp: new Date().toISOString(),
      format: 'JSON',
      version: '1.0'
    },
    summary: {
      totalEmails: analyzedEmails.length,
      totalCalendarEvents: calendarEvents.length,
      categoriesCount: report?.categories?.length || 0
    },
    priorityEmails: analyzedEmails.map((email, index) => ({
      rank: index + 1,
      id: email.id,
      subject: email.subject,
      from: email.from,
      priority: {
        score: email.priority?.priority_score || 5,
        urgency: email.priority?.urgency_level || 'Medium',
        reasoning: email.priority?.reasoning || 'No reasoning available'
      },
      summary: email.summary,
      hasCalendarEvents: email.calendar_events?.has_events || false,
      calendarEventsCount: email.calendar_events?.events?.length || 0
    })),
    calendarEvents: calendarEvents.map(event => ({
      title: event.title,
      type: event.event_type || 'meeting',
      date: event.date,
      time: event.time,
      location: event.location || '',
      description: event.description || '',
      meetingLink: event.meeting_link || '',
      attendees: event.attendees || [],
      sourceEmail: {
        id: event.emailId,
        subject: event.emailSubject,
        from: event.emailFrom
      }
    })),
    categories: report?.categories?.map(category => ({
      name: category.name,
      emailCount: category.emails?.length || 0,
      emails: category.emails?.map(email => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        summary: email.summary
      })) || []
    })) || []
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return blob;
};

/**
 * Export to CSV format
 */
export const exportToCSV = (analyzedEmails, calendarEvents, report) => {
  let csvContent = '';
  
  // Priority Emails CSV
  csvContent += '=== PRIORITY EMAILS ===\n';
  csvContent += 'Rank,Email ID,Subject,From,Priority Score,Urgency Level,Reasoning,Summary,Has Calendar Events\n';
  
  analyzedEmails.forEach((email, index) => {
    const row = [
      index + 1,
      email.id,
      `"${email.subject.replace(/"/g, '""')}"`,
      `"${email.from.replace(/"/g, '""')}"`,
      email.priority?.priority_score || 5,
      email.priority?.urgency_level || 'Medium',
      `"${(email.priority?.reasoning || 'No reasoning available').replace(/"/g, '""')}"`,
      `"${email.summary.replace(/"/g, '""')}"`,
      email.calendar_events?.has_events ? 'Yes' : 'No'
    ];
    csvContent += row.join(',') + '\n';
  });
  
  // Calendar Events CSV
  if (calendarEvents.length > 0) {
    csvContent += '\n=== CALENDAR EVENTS ===\n';
    csvContent += 'Title,Type,Date,Time,Location,Description,Meeting Link,Attendees,Source Email Subject,Source Email From\n';
    
    calendarEvents.forEach(event => {
      const row = [
        `"${event.title.replace(/"/g, '""')}"`,
        event.event_type || 'meeting',
        event.date,
        event.time,
        `"${(event.location || '').replace(/"/g, '""')}"`,
        `"${(event.description || '').replace(/"/g, '""')}"`,
        event.meeting_link || '',
        `"${(event.attendees || []).join('; ').replace(/"/g, '""')}"`,
        `"${event.emailSubject.replace(/"/g, '""')}"`,
        `"${event.emailFrom.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  }
  
  // Categories CSV
  if (report?.categories?.length > 0) {
    csvContent += '\n=== CATEGORIES ===\n';
    csvContent += 'Category,Email ID,Subject,From,Summary\n';
    
    report.categories.forEach(category => {
      if (category.emails && category.emails.length > 0) {
        category.emails.forEach(email => {
          const row = [
            `"${category.name.replace(/"/g, '""')}"`,
            email.id,
            `"${email.subject.replace(/"/g, '""')}"`,
            `"${email.from.replace(/"/g, '""')}"`,
            `"${email.summary.replace(/"/g, '""')}"`
          ];
          csvContent += row.join(',') + '\n';
        });
      }
    });
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return blob;
};

/**
 * Export to Plain Text format
 */
export const exportToTXT = (analyzedEmails, calendarEvents, report) => {
  let content = '';
  
  // Header
  content += '='.repeat(80) + '\n';
  content += '                    EMAIL BATCH SUMMARY REPORT\n';
  content += '='.repeat(80) + '\n';
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Emails: ${analyzedEmails.length}\n`;
  content += `Calendar Events: ${calendarEvents.length}\n`;
  content += `Categories: ${report?.categories?.length || 0}\n\n`;
  
  // Priority Emails Section
  content += '📊 PRIORITY SORTED EMAILS\n';
  content += '-'.repeat(80) + '\n';
  
  analyzedEmails.forEach((email, index) => {
    const priorityLevel = email.priority?.urgency_level || 'Medium';
    const priorityScore = email.priority?.priority_score || 5;
    const priorityIndicator = priorityScore >= 8 ? '🔴' : priorityScore >= 6 ? '🟡' : '🟢';
    
    content += `\n${priorityIndicator} #${index + 1} [Priority: ${priorityScore}/10 - ${priorityLevel}]\n`;
    content += `Subject: ${email.subject}\n`;
    content += `From: ${email.from}\n`;
    content += `Priority Reasoning: ${email.priority?.reasoning || 'No reasoning available'}\n`;
    content += `Summary: ${email.summary}\n`;
    if (email.calendar_events?.has_events) {
      content += `📅 Contains ${email.calendar_events.events?.length || 0} calendar event(s)\n`;
    }
    content += '-'.repeat(80) + '\n';
  });
  
  // Calendar Events Section
  if (calendarEvents.length > 0) {
    content += '\n\n📅 EXTRACTED CALENDAR EVENTS\n';
    content += '-'.repeat(80) + '\n';
    
    // Group events by date for better organization
    const eventsByDate = {};
    calendarEvents.forEach(event => {
      const date = event.date || 'Unknown Date';
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });
    
    Object.keys(eventsByDate).sort().forEach(date => {
      content += `\n📅 ${date}\n`;
      content += '~'.repeat(40) + '\n';
      
      eventsByDate[date].forEach((event, index) => {
        const eventIcon = event.event_type === 'meeting' ? '🤝' : event.event_type === 'appointment' ? '📋' : '⏰';
        content += `\n${eventIcon} ${event.title}\n`;
        content += `   Type: ${event.event_type || 'meeting'}\n`;
        content += `   Time: ${event.time}\n`;
        if (event.location) content += `   Location: ${event.location}\n`;
        if (event.description) content += `   Description: ${event.description}\n`;
        if (event.meeting_link) content += `   Meeting Link: ${event.meeting_link}\n`;
        if (event.attendees && event.attendees.length > 0) {
          content += `   Attendees: ${event.attendees.join(', ')}\n`;
        }
        content += `   Source: ${event.emailSubject} (from ${event.emailFrom})\n`;
        if (index < eventsByDate[date].length - 1) {
          content += '   ' + '.'.repeat(35) + '\n';
        }
      });
      content += '~'.repeat(40) + '\n';
    });
  }
  
  // Categories Section
  if (report?.categories?.length > 0) {
    content += '\n\n📋 TRADITIONAL CATEGORY REPORT\n';
    content += '-'.repeat(80) + '\n';
    
    report.categories.forEach((category, index) => {
      content += `\n📁 ${index + 1}. ${category.name} (${category.emails?.length || 0} emails)\n`;
      content += '='.repeat(60) + '\n';
      
      if (category.emails && category.emails.length > 0) {
        category.emails.forEach((email, emailIndex) => {
          content += `\n   📧 ${emailIndex + 1}. ${email.subject}\n`;
          content += `      From: ${email.from}\n`;
          content += `      ID: ${email.id}\n`;
          content += `      Summary: ${email.summary}\n`;
          if (emailIndex < category.emails.length - 1) {
            content += '      ' + '.'.repeat(50) + '\n';
          }
        });
      } else {
        content += '   📭 No emails in this category.\n';
      }
      content += '\n';
    });
  }
  
  // Footer
  content += '\n' + '='.repeat(80) + '\n';
  content += '                    END OF REPORT\n';
  content += '='.repeat(80) + '\n';
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  return blob;
};

/**
 * Export to HTML format
 */
export const exportToHTML = (analyzedEmails, calendarEvents, report) => {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Batch Summary Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .summary-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 8px;
        }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-title {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .priority-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            background: #fafafa;
        }
        .priority-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .priority-badge {
            padding: 5px 12px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        .priority-high { background-color: #e74c3c; }
        .priority-medium { background-color: #f39c12; }
        .priority-low { background-color: #27ae60; }
        .calendar-item {
            border: 1px solid #3498db;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9ff;
        }
        .event-type {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            background: #3498db;
            color: white;
        }
        .category-item {
            border: 1px solid #95a5a6;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            background: #f9f9f9;
        }
        .email-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        @media print {
            body { background-color: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 Email Batch Summary Report</h1>
        <div class="summary-stats">
            <div class="stat-item">
                <h3>${analyzedEmails.length}</h3>
                <p>Total Emails</p>
            </div>
            <div class="stat-item">
                <h3>${calendarEvents.length}</h3>
                <p>Calendar Events</p>
            </div>
            <div class="stat-item">
                <h3>${report?.categories?.length || 0}</h3>
                <p>Categories</p>
            </div>
        </div>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
        <h2 class="section-title">📊 Priority Sorted Emails</h2>
        ${analyzedEmails.map((email, index) => `
            <div class="priority-item">
                <div class="priority-header">
                    <div>
                        <strong>#${index + 1}</strong>
                        <span style="margin-left: 10px; font-size: 1.1em;">${email.subject}</span>
                    </div>
                    <div class="priority-badge priority-${(email.priority?.urgency_level || 'medium').toLowerCase()}">
                        ${email.priority?.priority_score || 5}/10 - ${email.priority?.urgency_level || 'Medium'}
                    </div>
                </div>
                <p><strong>From:</strong> ${email.from}</p>
                <p><strong>Priority Reasoning:</strong> ${email.priority?.reasoning || 'No reasoning available'}</p>
                <p><strong>Summary:</strong> ${email.summary}</p>
                ${email.calendar_events?.has_events ? `<p style="color: #3498db;"><strong>📅 Contains ${email.calendar_events.events?.length || 0} calendar event(s)</strong></p>` : ''}
            </div>
        `).join('')}
    </div>

    ${calendarEvents.length > 0 ? `
    <div class="section">
        <h2 class="section-title">📅 Extracted Calendar Events</h2>
        ${calendarEvents.map((event, index) => `
            <div class="calendar-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0;">${event.title}</h4>
                    <span class="event-type">${event.event_type || 'meeting'}</span>
                </div>
                <p><strong>📅 Date:</strong> ${event.date}</p>
                <p><strong>🕐 Time:</strong> ${event.time}</p>
                ${event.location ? `<p><strong>📍 Location:</strong> ${event.location}</p>` : ''}
                ${event.description ? `<p><strong>📝 Description:</strong> ${event.description}</p>` : ''}
                ${event.meeting_link ? `<p><strong>🔗 Meeting Link:</strong> <a href="${event.meeting_link}" target="_blank">${event.meeting_link}</a></p>` : ''}
                ${event.attendees && event.attendees.length > 0 ? `<p><strong>👥 Attendees:</strong> ${event.attendees.join(', ')}</p>` : ''}
                <p style="font-size: 0.9em; color: #7f8c8d;"><strong>Source Email:</strong> ${event.emailSubject} (from ${event.emailFrom})</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${report?.categories?.length > 0 ? `
    <div class="section">
        <h2 class="section-title">📋 Traditional Category Report</h2>
        ${report.categories.map((category, index) => `
            <div class="category-item">
                <h3>${category.name}</h3>
                ${category.emails && category.emails.length > 0 ? `
                    ${category.emails.map(email => `
                        <div class="email-item">
                            <h4>${email.subject}</h4>
                            <p><strong>From:</strong> ${email.from}</p>
                            <p><strong>Summary:</strong> ${email.summary}</p>
                        </div>
                    `).join('')}
                ` : '<p>No emails in this category.</p>'}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="footer">
        <p>This report was generated automatically by the Email Management System.</p>
        <p>For questions or support, please contact your system administrator.</p>
    </div>
</body>
</html>
  `;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  return blob;
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Main export function
 */
export const exportReport = async (format, analyzedEmails, calendarEvents, report) => {
  let blob;
  let filename;
  
  switch (format) {
    case 'json':
      blob = exportToJSON(analyzedEmails, calendarEvents, report);
      filename = generateFilename('json');
      break;
    case 'csv':
      blob = exportToCSV(analyzedEmails, calendarEvents, report);
      filename = generateFilename('csv');
      break;
    case 'txt':
      blob = exportToTXT(analyzedEmails, calendarEvents, report);
      filename = generateFilename('txt');
      break;
    case 'html':
      blob = exportToHTML(analyzedEmails, calendarEvents, report);
      filename = generateFilename('html');
      break;
    case 'pdf':
      // PDF export will be implemented using jsPDF or similar library
      // For now, we'll export as HTML and suggest printing to PDF
      blob = exportToHTML(analyzedEmails, calendarEvents, report);
      filename = generateFilename('html');
      alert('PDF导出功能正在开发中。当前将导出为HTML格式，您可以在浏览器中打开后使用"打印为PDF"功能。');
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
  
  downloadBlob(blob, filename);
  return filename;
};