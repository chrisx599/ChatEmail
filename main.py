"""
Main application file for the Email AI Assistant.
"""
import logging
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

from email_client import EmailClient
from ai_service import summarize_email
from config import (
    LOG_LEVEL,
    MARK_AS_READ,
    MOVE_TO_FOLDER_ON_SUCCESS,
    FETCH_LIMIT,
    FETCH_DAYS,
    IMAP_MAILBOX
)

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper()),
                    format='%(asctime)s - %(levelname)s - %(message)s')

console = Console()

def main():
    """Main function to run the email assistant."""
    console.print("[bold cyan]Email AI Assistant started...[/bold cyan]")
    logging.info("Application started.")

    client = EmailClient()
    if not client.connect():
        console.print("[bold red]Failed to connect to email server. Exiting.[/bold red]")
        logging.error("Failed to connect to email server. Exiting.")
        return

    try:
        console.print(f"[bold]Fetching emails from mailbox:[/bold] [yellow]{IMAP_MAILBOX}[/yellow]")
        if FETCH_DAYS > 0:
            console.print(f"[bold]Fetching emails from last:[/bold] [yellow]{FETCH_DAYS} days[/yellow]")
        if FETCH_LIMIT > 0:
            console.print(f"[bold]Fetching up to:[/bold] [yellow]{FETCH_LIMIT} emails[/yellow]")

        emails_to_process = client.fetch_emails()

        if not emails_to_process:
            console.print("[bold green]No emails found matching criteria. All caught up![/bold green]")
            logging.info("No emails found matching criteria.")
        else:
            console.print(f"[bold yellow]Found {len(emails_to_process)} emails to process. Processing...[/bold yellow]\n")
            logging.info(f"Found {len(emails_to_process)} emails to process.")

            for email_data in emails_to_process:
                console.print("--- " * 10)
                console.print(f"[bold]Processing Email ID:[/bold] {email_data['id']}")
                console.print(f"[bold]From:[/bold] {email_data['from']}")
                console.print(f"[bold]Subject:[/bold] {email_data['subject']}")

                with console.status("[italic blue]Summarizing with AI...[/italic blue]", spinner="dots"):
                    summary = summarize_email(email_data['subject'], email_data['body'])
                
                summary_panel = Panel(
                    Text(summary, style="white"),
                    title="[bold green]AI Summary[/bold green]",
                    border_style="green",
                    expand=False
                )
                console.print(summary_panel)

                if MARK_AS_READ:
                    client.mark_email_as_read(email_data['id'])
                
                if MOVE_TO_FOLDER_ON_SUCCESS:
                    client.move_email_to_folder(email_data['id'], MOVE_TO_FOLDER_ON_SUCCESS)

    finally:
        client.close()
        console.print("[bold cyan]Process finished and disconnected.[/bold cyan]")
        logging.info("Application finished and disconnected.")

if __name__ == "__main__":
    main()