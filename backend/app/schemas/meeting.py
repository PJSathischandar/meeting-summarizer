from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.meeting import MeetingStatus


class ActionItem(BaseModel):
    task: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = "medium"


class MeetingBase(BaseModel):
    title: str


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    transcript: Optional[str] = None


class MeetingResponse(MeetingBase):
    id: int
    user_id: str
    file_path: Optional[str]
    transcript: Optional[str]
    summary: Optional[str]
    action_items: Optional[List[Dict[str, Any]]]
    status: MeetingStatus
    created_at: datetime
    updated_at: Optional[datetime]
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class TranscriptUpload(BaseModel):
    title: str
    transcript: str


class SummaryResponse(BaseModel):
    summary: str
    action_items: List[ActionItem]
    key_points: List[str]
    participants: Optional[List[str]] = []
