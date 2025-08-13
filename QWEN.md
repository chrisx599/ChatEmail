# ChatEmail Project Context for Qwen Code

## Project Overview

ChatEmail is a Python application that integrates with an email account (via IMAP) to fetch emails and uses AI services (primarily OpenAI) to summarize them. It provides both a command-line interface (CLI) and a web-based graphical user interface (GUI) built with React.

### Main Components

1.  **Backend (Python):**
    *   `main.py`: The entry point for the CLI application.
    *   `api.py`: A FastAPI web server that exposes endpoints for configuration, fetching emails, and AI analysis. This is the backend for the React frontend.
    *   `email_client.py`: Handles connecting to the IMAP server, fetching emails, and basic email actions (mark as read, move).
    *   `ai_service.py`: Interfaces with the AI provider (OpenAI) to perform tasks like email summarization.
    *   `config.py`: Loads and validates application settings from environment variables (`.env` file).
2.  **Frontend (React):**
    *   Located in the `frontend/` directory.
    *   Provides a web UI to configure the application, fetch emails, view them, and trigger AI analysis (summarization).

### Key Technologies

*   **Backend:** Python 3, FastAPI, `imaplib`, `openai` Python SDK.
*   **Frontend:** React, JavaScript, CSS.
*   **Configuration:** Environment variables (`.env` file).
*   **Dependencies:** Managed via `requirements.txt` (Python) and `package.json` (Node.js).

## Building and Running

### Prerequisites

1.  Python 3.7+
2.  Node.js and npm (for the frontend)
3.  An email account with IMAP access enabled.
4.  An API key for your chosen AI provider (e.g., OpenAI API key).

### Backend (API & CLI)

1.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Configure the application:**
    *   Create a `.env` file in the project root (`/Users/liangzhengyang/github/ChatEmail/.env`) based on the variables used in `config.py`. Essential variables include `IMAP_SERVER`, `EMAIL_ADDRESS`, `EMAIL_PASSWORD`, and `OPENAI_API_KEY`.
3.  **Run the CLI:**
    ```bash
    python main.py
    ```
4.  **Run the API Server:**
    ```bash
    uvicorn api:app --reload --host 0.0.0.0 --port 8000
    ```
    The API will be available, typically at `http://localhost:8000`.

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    ```
    The React application will usually open automatically in your browser at `http://localhost:3000`. It expects the backend API to be running at `http://localhost:8000`.

## Development Conventions

*   **Python:** The backend follows standard Python practices. It uses `python-dotenv` for configuration management. Code is structured into modules for clarity (email handling, AI service, configuration).
*   **FastAPI:** The `api.py` file uses FastAPI to define API endpoints and Pydantic models for request/response validation.
*   **React:** The frontend is a standard Create React App project. It uses functional components with hooks (`useState`, `useEffect`). API calls are centralized in `frontend/src/api.js`.
*   **Configuration:** All configuration is managed through environment variables loaded via `config.py`. This makes it easy to change settings without modifying code and allows the frontend to update them dynamically via the API.
*   **Logging:** Python's `logging` module is used for outputting information and errors.
