"""
Main application file for the Email AI Assistant.
"""
from email_client import EmailClient
from ai_service import summarize_email_with_openai
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

def main():
    """Main function to run the email assistant."""
    console = Console()
    console.print("[bold cyan]Email AI Assistant started...[/bold cyan]")

    client = EmailClient()
    if not client.connect():
        console.print("[bold red]Failed to connect to email server. Exiting.[/bold red]")
        return

    try:
        # Fetch up to 5 unread emails
        unread_emails = client.fetch_unread_emails(limit=5)

        if not unread_emails:
            console.print("[bold green]No unread emails found. All caught up![/bold green]")
        else:
            console.print(f"[bold yellow]Found {len(unread_emails)} unread emails. Processing...[/bold yellow]\n")

            for email in unread_emails:
                console.print(f"[bold]From:[/bold] {email['from']}")
                console.print(f"[bold]Subject:[/bold] {email['subject']}")

                with console.status("[italic blue]Summarizing with AI...[/italic blue]", spinner="dots"):
                    summary = summarize_email_with_openai(email['subject'], email['body'])
                
                # Create a panel for the summary
                summary_panel = Panel(
                    Text(summary, style="white"),
                    title="[bold green]AI Summary[/bold green]",
                    border_style="green",
                    expand=False
                )
                console.print(summary_panel)
                console.print("---" * 10)

    finally:
        client.close()
        console.print("[bold cyan]Process finished and disconnected.[/bold cyan]")

if __name__ == "__main__":
    main()
