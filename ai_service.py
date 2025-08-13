"""
AI Service for processing email content.
"""
import openai
from config import OPENAI_API_KEY

# Initialize the OpenAI client
if OPENAI_API_KEY:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
else:
    client = None

def summarize_email_with_openai(subject: str, body: str) -> str:
    """
    Summarizes an email using the OpenAI API.

    Args:
        subject: The subject of the email.
        body: The body content of the email.

    Returns:
        A string containing the summary of the email, or an error message.
    """
    if not client:
        return "[ERROR] OpenAI client not initialized. Please check your OPENAI_API_KEY."

    # Truncate body to avoid exceeding token limits, preserving the start of the email
    max_body_length = 4000  # A safe limit to avoid overly long prompts
    truncated_body = body[:max_body_length]

    try:
        prompt = f"Please summarize the following email concisely. Extract the key information and any required actions. The summary should be in Chinese.\n\nSubject: {subject}\n\nBody:\n{truncated_body}"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an efficient assistant that summarizes emails."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.5,
            max_tokens=200,
        )
        if response.choices:
            return response.choices[0].message.content.strip()
        else:
            return "[ERROR] No summary received from AI."

    except openai.APIError as e:
        return f"[ERROR] OpenAI API error: {e}"
    except Exception as e:
        return f"[ERROR] An unexpected error occurred: {e}"

# You can add a similar function for Claude (Anthropic) here if needed.
