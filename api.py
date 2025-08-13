from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from dotenv import load_dotenv, set_key

# Import your existing email client
from email_client import EmailClient
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
    # This is a bit of a hack to reload the config module
    import importlib
    importlib.reload(app_config)

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
        load_dotenv(dotenv_path=DOTENV_PATH)
        env_vars = {key: os.getenv(key) for key in AppConfig.model_fields.keys()}
        return AppConfig(**env_vars)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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