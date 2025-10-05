import openai
import json
from typing import Dict, Any
from ..core.config import settings
from ..schemas.meeting import SummaryResponse, ActionItem

openai.api_key = settings.OPENAI_API_KEY


class SummarizationService:
    @staticmethod
    async def summarize_meeting(transcript: str) -> SummaryResponse:
        """
        Generate summary and action items from meeting transcript using GPT-4o
        """
        try:
            prompt = f"""Analyze the following meeting transcript and provide:
1. A concise summary of the meeting
2. Key action items with assignees (if mentioned)
3. Main discussion points
4. List of participants (if identifiable)

Format your response as JSON with the following structure:
{{
    "summary": "Brief summary of the meeting",
    "action_items": [
        {{
            "task": "Description of the task",
            "assignee": "Person responsible (if mentioned)",
            "due_date": "Due date (if mentioned)",
            "priority": "high/medium/low"
        }}
    ],
    "key_points": ["Point 1", "Point 2", ...],
    "participants": ["Name 1", "Name 2", ...]
}}

Meeting Transcript:
{transcript}
"""

            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes meeting transcripts and extracts summaries, action items, and key points. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            
            # Convert action items to ActionItem objects
            action_items = [ActionItem(**item) for item in result.get("action_items", [])]
            
            return SummaryResponse(
                summary=result.get("summary", ""),
                action_items=action_items,
                key_points=result.get("key_points", []),
                participants=result.get("participants", [])
            )
        except Exception as e:
            raise Exception(f"Summarization failed: {str(e)}")
