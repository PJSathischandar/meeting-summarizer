import json
import httpx
from typing import Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class ExportService:
    @staticmethod
    def export_to_json(meeting_data: Dict[str, Any]) -> str:
        """
        Export meeting summary to JSON format
        """
        export_data = {
            "title": meeting_data.get("title"),
            "summary": meeting_data.get("summary"),
            "action_items": meeting_data.get("action_items", []),
            "transcript": meeting_data.get("transcript"),
            "created_at": str(meeting_data.get("created_at"))
        }
        return json.dumps(export_data, indent=2)

    @staticmethod
    async def export_to_slack(webhook_url: str, meeting_data: Dict[str, Any]) -> bool:
        """
        Export meeting summary to Slack
        """
        try:
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"📝 {meeting_data.get('title', 'Meeting Summary')}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Summary:*\n{meeting_data.get('summary', 'No summary available')}"
                    }
                }
            ]

            action_items = meeting_data.get('action_items', [])
            if action_items:
                action_text = "*Action Items:*\n" + "\n".join(
                    [f"• {item.get('task', '')} - {item.get('assignee', 'Unassigned')}" 
                     for item in action_items]
                )
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": action_text
                    }
                })

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook_url,
                    json={"blocks": blocks}
                )
                return response.status_code == 200
        except Exception as e:
            raise Exception(f"Slack export failed: {str(e)}")

    @staticmethod
    def format_email_content(meeting_data: Dict[str, Any]) -> str:
        """
        Format meeting summary for email
        """
        html = f"""
        <html>
        <body>
            <h2>{meeting_data.get('title', 'Meeting Summary')}</h2>
            <h3>Summary</h3>
            <p>{meeting_data.get('summary', 'No summary available')}</p>
            <h3>Action Items</h3>
            <ul>
        """
        
        action_items = meeting_data.get('action_items', [])
        for item in action_items:
            html += f"""
                <li>
                    <strong>{item.get('task', '')}</strong><br>
                    Assignee: {item.get('assignee', 'Unassigned')}<br>
                    Priority: {item.get('priority', 'medium')}
                </li>
            """
        
        html += """
            </ul>
        </body>
        </html>
        """
        return html
