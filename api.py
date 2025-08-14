from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, RootModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv, set_key

# Import your existing modules
from email_client import EmailClient
from ai_service import summarize_email, generate_batch_summary_report, analyze_email_comprehensive
from config_manager import config_manager

# --- Pydantic Models ---

class AppConfig(BaseModel):
    IMAP_SERVER: str = Field("imap.example.com", title="IMAP Server")
    IMAP_PORT: int = Field(993, title="IMAP Port")
    EMAIL_ADDRESS: str
    EMAIL_PASSWORD: str
    IMAP_MAILBOX: str = Field("INBOX", title="IMAP Mailbox")
    FETCH_CRITERIA: str = Field("UNSEEN", title="Fetch Criteria")
    FETCH_LIMIT: int = Field(10, title="Fetch Limit")
    FETCH_DAYS: int = Field(0, title="Fetch Days")
    MARK_AS_READ: bool = Field(True, title="Mark as Read")
    MOVE_TO_FOLDER_ON_SUCCESS: Optional[str] = Field(None, title="Move to Folder on Success")
    AI_PROVIDER: str = Field("openai", title="AI Provider")
    OPENAI_API_KEY: Optional[str] = Field(None, title="OpenAI API Key")
    ANTHROPIC_API_KEY: Optional[str] = Field(None, title="Anthropic API Key")
    OPENROUTER_API_KEY: Optional[str] = Field(None, title="OpenRouter API Key")
    OPENAI_BASE_URL: str = Field("https://api.openai.com/v1", title="OpenAI Base URL")
    OPENROUTER_BASE_URL: Optional[str] = Field("https://openrouter.ai/api/v1", title="OpenRouter Base URL")
    OPENAI_MODEL: str = Field("gpt-4o-mini", title="OpenAI Model")
    OPENROUTER_MODEL: Optional[str] = Field("openai/gpt-4o-mini", title="OpenRouter Model")
    AI_OUTPUT_LANGUAGE: str = Field("Chinese", title="AI Output Language")
    AI_TEMPERATURE: float = Field(0.5, title="AI Temperature")
    AI_MAX_TOKENS: int = Field(250, title="AI Max Tokens")
    LOG_LEVEL: str = Field("INFO", title="Log Level")

class Email(BaseModel):
    id: str
    from_: str = Field(..., alias='from')
    to: Optional[str] = None
    cc: Optional[str] = None
    date: Optional[str] = None
    reply_to: Optional[str] = Field(None, alias='reply_to')
    subject: str
    body: str

class AnalyzeRequest(BaseModel):
    subject: str
    body: str

class AnalyzeResponse(BaseModel):
    summary: str

class ComprehensiveAnalyzeRequest(BaseModel):
    subject: str
    body: str
    from_addr: str = Field(..., alias='from')

class PriorityAnalysis(BaseModel):
    priority_score: int
    urgency_level: str
    reasoning: str
    action_required: bool
    estimated_response_time: str

class CalendarEvent(BaseModel):
    title: str
    date: str
    time: str
    location: str
    attendees: List[str]
    description: str
    meeting_link: Optional[str]
    event_type: str

class CalendarEvents(BaseModel):
    has_events: bool
    events: List[CalendarEvent]
    action_items: List[str]
    rsvp_required: bool

class ComprehensiveAnalyzeResponse(BaseModel):
    summary: str
    priority_analysis: PriorityAnalysis
    calendar_events: CalendarEvents

class BatchSummarizeWithDataRequest(BaseModel):
    emails: List[Email]

# Pydantic model for the batch summary response
# Using a generic Dict[str, Any] for flexibility, as the structure is defined by the AI
# Alternatively, a more specific model could be defined if the structure is fixed
# In Pydantic v2, we use RootModel for this purpose
class BatchSummarizeResponse(RootModel[Dict[str, Any]]):
    pass

# --- FastAPI App Initialization ---
app = FastAPI()

# CORS Middleware
origins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---
DOTENV_PATH = os.path.join(os.path.dirname(__file__), '.env')

def reload_config():
    """Reloads the configuration from the .env file."""
    load_dotenv(dotenv_path=DOTENV_PATH, override=True)
    # Use ConfigManager's reload method for hot-swappable configuration
    config_manager.reload_config()

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the ChatEmail AI Assistant API"}

@app.post("/api/config")
def save_configuration(config: AppConfig):
    try:
        for key, value in config.model_dump().items():
            value_str = str(value) if value is not None else ""
            set_key(DOTENV_PATH, key, value_str)
        reload_config() # Reload config after saving
        return {"message": "Configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/config", response_model=AppConfig)
def get_configuration():
    try:
        # Use ConfigManager to get current configuration
        config = config_manager.get_all_config()
        env_vars = {key: getattr(config, key, None) for key in AppConfig.model_fields.keys()}
        
        # Handle required fields that might be None
        if env_vars.get('EMAIL_ADDRESS') is None:
            env_vars['EMAIL_ADDRESS'] = ''
        if env_vars.get('EMAIL_PASSWORD') is None:
            env_vars['EMAIL_PASSWORD'] = ''
            
        return AppConfig(**env_vars)
    except Exception as e:
        import traceback
        error_detail = f"Configuration error: {str(e)}\nTraceback: {traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/api/emails", response_model=List[Email])
def get_emails():
    """Connects to the email server and fetches emails."""
    reload_config() # Ensure latest config is used
    client = EmailClient()
    if not client.connect():
        raise HTTPException(status_code=500, detail="Could not connect to email server.")
    
    try:
        emails = client.fetch_emails()
        return emails
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching emails: {e}")
    finally:
        client.close()

@app.post("/api/analyze/summarize", response_model=AnalyzeResponse)
def analyze_email_summary(request: AnalyzeRequest):
    """Receives email content and returns an AI-generated summary."""
    reload_config() # Ensure AI service uses latest config
    try:
        summary = summarize_email(subject=request.subject, body=request.body)
        if summary.startswith("[ERROR]"):
            raise HTTPException(status_code=500, detail=summary)
        return AnalyzeResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during analysis: {e}")

@app.post("/api/batch-summarize", response_model=BatchSummarizeResponse)
def batch_summarize_emails():
    """
    Fetches emails and generates a batch summary report.
    """
    reload_config() # Ensure latest config is used
    client = EmailClient()
    if not client.connect():
        raise HTTPException(status_code=500, detail="Could not connect to email server for batch summary.")
    
    try:
        emails = client.fetch_emails()
        if not emails:
             # Return an empty but valid structure if no emails
            return BatchSummarizeResponse({"categories": []})
        
        report = generate_batch_summary_report(emails)
        
        # Check if the AI service returned an error
        if "error" in report:
            raise HTTPException(status_code=500, detail=report["error"])
            
        return BatchSummarizeResponse(report)
    except HTTPException:
        # Re-raise HTTPExceptions (e.g., from connect failure)
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during batch summarization: {e}")
    finally:
        client.close()

@app.post("/api/batch-summarize-with-data", response_model=BatchSummarizeResponse)
def batch_summarize_emails_with_data(request: BatchSummarizeWithDataRequest):
    """
    Generates a batch summary report from provided email data.
    """
    reload_config() # Ensure latest config is used
    
    try:
        if not request.emails:
             # Return an empty but valid structure if no emails
            return BatchSummarizeResponse({"categories": []})
        
        # Convert Pydantic models to dictionaries, ensuring the 'from' field is correctly named
        # We need to use by_alias=True to use the alias 'from' instead of 'from_'
        email_dicts = [email.model_dump(by_alias=True) for email in request.emails]
        report = generate_batch_summary_report(email_dicts)
        
        # Check if the AI service returned an error
        if "error" in report:
            raise HTTPException(status_code=500, detail=report["error"])
            
        return BatchSummarizeResponse(report)
    except HTTPException:
        # Re-raise HTTPExceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during batch summarization: {e}")

@app.post("/api/analyze/comprehensive", response_model=ComprehensiveAnalyzeResponse)
def analyze_email_comprehensive_endpoint(request: ComprehensiveAnalyzeRequest):
    """
    Performs comprehensive email analysis including summary, priority scoring, and calendar event extraction.
    """
    reload_config() # Ensure AI service uses latest config
    try:
        # Get comprehensive analysis
        analysis = analyze_email_comprehensive(
            subject=request.subject, 
            body=request.body, 
            from_addr=request.from_addr
        )
        
        # Check for errors in any component
        if "error" in analysis.get("priority_analysis", {}):
            raise HTTPException(status_code=500, detail=analysis["priority_analysis"]["error"])
        if "error" in analysis.get("calendar_events", {}):
            raise HTTPException(status_code=500, detail=analysis["calendar_events"]["error"])
        if analysis["summary"].startswith("[ERROR]"):
            raise HTTPException(status_code=500, detail=analysis["summary"])
        
        # Safely extract and validate priority analysis data
        priority_data = analysis.get("priority_analysis", {})
        safe_priority_analysis = {
            "priority_score": priority_data.get("priority_score", 5),
            "urgency_level": priority_data.get("urgency_level", "中"),
            "reasoning": priority_data.get("reasoning", "无法分析"),
            "action_required": priority_data.get("action_required", False),
            "estimated_response_time": priority_data.get("estimated_response_time", "1天内")
        }
        
        # Safely extract and validate calendar events data
        calendar_data = analysis.get("calendar_events", {})
        safe_calendar_events = {
            "has_events": calendar_data.get("has_events", False),
            "events": [],
            "action_items": calendar_data.get("action_items", []),
            "rsvp_required": calendar_data.get("rsvp_required", False)
        }
        
        # Process events if they exist
        if calendar_data.get("events"):
            for event in calendar_data["events"]:
                safe_event = {
                    "title": event.get("title", "未知活动"),
                    "date": event.get("date", "待定"),
                    "time": event.get("time", "待定"),
                    "location": event.get("location", "待定"),
                    "attendees": event.get("attendees", []),
                    "description": event.get("description", ""),
                    "meeting_link": event.get("meeting_link"),
                    "event_type": event.get("event_type", "其他")
                }
                safe_calendar_events["events"].append(safe_event)
        
        # Structure the response with validated data
        return ComprehensiveAnalyzeResponse(
            summary=analysis["summary"],
            priority_analysis=PriorityAnalysis(**safe_priority_analysis),
            calendar_events=CalendarEvents(**safe_calendar_events)
        )
    except HTTPException:
        # Re-raise HTTPExceptions
        raise
    except Exception as e:
        import traceback
        error_detail = f"An unexpected error occurred during comprehensive analysis: {e}\nTraceback: {traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)