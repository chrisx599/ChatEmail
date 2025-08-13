from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import os
import json
from dotenv import load_dotenv, set_key

# Import your existing modules
from email_client import EmailClient
from ai_service import summarize_email, categorize_email
import config as app_config # Import your config loader

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
    OPENAI_BASE_URL: str = Field("https://api.openai.com/v1", title="OpenAI Base URL")
    OPENAI_MODEL: str = Field("gpt-4o-mini", title="OpenAI Model")
    AI_OUTPUT_LANGUAGE: str = Field("Chinese", title="AI Output Language")
    AI_TEMPERATURE: float = Field(0.5, title="AI Temperature")
    AI_MAX_TOKENS: int = Field(250, title="AI Max Tokens")
    LOG_LEVEL: str = Field("INFO", title="Log Level")

class Email(BaseModel):
    id: str
    from_: str = Field(..., alias='from')
    subject: str
    body: str

class AnalyzeRequest(BaseModel):
    subject: str
    body: str

class AnalyzeSummaryResponse(BaseModel):
    summary: str

class AnalyzeCategoryResponse(BaseModel):
    category: str

class ListCreateRequest(BaseModel):
    name: str

class AddEmailToListRequest(BaseModel):
    email_id: str

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
DATASTORE_PATH = os.path.join(os.path.dirname(__file__), 'datastore.json')

def load_datastore() -> Dict:
    if not os.path.exists(DATASTORE_PATH):
        return {"lists": {}}
    with open(DATASTORE_PATH, 'r') as f:
        return json.load(f)

def save_datastore(data: Dict):
    with open(DATASTORE_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def reload_config():
    load_dotenv(dotenv_path=DOTENV_PATH, override=True)
    import importlib
    importlib.reload(app_config)
    from ai_service import __name__ as ai_service_name
    import sys
    if ai_service_name in sys.modules:
        importlib.reload(sys.modules[ai_service_name])

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the ChatEmail AI Assistant API"}

# ... (config and email endpoints) ...
@app.post("/api/config")
def save_configuration(config: AppConfig):
    try:
        for key, value in config.model_dump().items():
            value_str = str(value) if value is not None else ""
            set_key(DOTENV_PATH, key, value_str)
        reload_config()
        return {"message": "Configuration saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/config", response_model=AppConfig)
def get_configuration():
    try:
        load_dotenv(dotenv_path=DOTENV_PATH)
        env_vars = {key: os.getenv(key) for key in AppConfig.model_fields.keys()}
        return AppConfig(**env_vars)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/emails", response_model=List[Email])
def get_emails():
    reload_config()
    client = EmailClient()
    if not client.connect():
        raise HTTPException(status_code=500, detail="Could not connect to email server.")
    try:
        return client.fetch_emails()
    finally:
        client.close()

# --- AI Endpoints ---
@app.post("/api/analyze/summarize", response_model=AnalyzeSummaryResponse)
def analyze_email_summary(request: AnalyzeRequest):
    reload_config()
    try:
        summary = summarize_email(subject=request.subject, body=request.body)
        if summary.startswith("[ERROR]"):
            raise HTTPException(status_code=500, detail=summary)
        return AnalyzeSummaryResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during analysis: {e}")

@app.post("/api/analyze/categorize", response_model=AnalyzeCategoryResponse)
def analyze_email_category(request: AnalyzeRequest):
    reload_config()
    datastore = load_datastore()
    list_names = list(datastore.get("lists", {}).keys())
    if not list_names:
        raise HTTPException(status_code=400, detail="No lists available for categorization. Please create a list first.")
    try:
        category = categorize_email(subject=request.subject, body=request.body, list_names=list_names)
        if category.startswith("[ERROR]"):
            raise HTTPException(status_code=500, detail=category)
        return AnalyzeCategoryResponse(category=category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during categorization: {e}")

# --- List Management Endpoints ---
@app.get("/api/lists", response_model=List[str])
def get_lists():
    datastore = load_datastore()
    return list(datastore["lists"].keys())

@app.post("/api/lists")
def create_list(request: ListCreateRequest):
    datastore = load_datastore()
    list_name = request.name.strip()
    if not list_name:
        raise HTTPException(status_code=400, detail="List name cannot be empty.")
    if list_name in datastore["lists"]:
        raise HTTPException(status_code=400, detail=f"List '{list_name}' already exists.")
    datastore["lists"][list_name] = []
    save_datastore(datastore)
    return {"message": f"List '{list_name}' created successfully."}

@app.post("/api/lists/{list_name}/emails")
def add_email_to_list(list_name: str, request: AddEmailToListRequest):
    datastore = load_datastore()
    if list_name not in datastore["lists"]:
        raise HTTPException(status_code=404, detail=f"List '{list_name}' not found.")
    email_id = request.email_id
    if email_id not in datastore["lists"][list_name]:
        datastore["lists"][list_name].append(email_id)
        save_datastore(datastore)
        return {"message": f"Email {email_id} added to list '{list_name}'."}
    else:
        return {"message": f"Email {email_id} is already in list '{list_name}'."}