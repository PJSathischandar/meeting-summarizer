from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from pathlib import Path

from ..core.database import get_db
from ..models.meeting import Meeting, MeetingStatus
from ..schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse,
    TranscriptUpload,
)
from ..services import TranscriptionService, SummarizationService, AuthService, ExportService
from ..core.config import settings

router = APIRouter(prefix="/meetings", tags=["meetings"])


async def process_meeting(meeting_id: int, db: Session):
    """
    Background task to process meeting: transcribe and summarize
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        return

    try:
        # Transcribe if file exists
        if meeting.file_path and not meeting.transcript:
            meeting.status = MeetingStatus.TRANSCRIBING
            db.commit()
            
            transcript = await TranscriptionService.transcribe_audio(meeting.file_path)
            meeting.transcript = transcript
            db.commit()

        # Summarize
        if meeting.transcript:
            meeting.status = MeetingStatus.SUMMARIZING
            db.commit()
            
            summary_result = await SummarizationService.summarize_meeting(meeting.transcript)
            meeting.summary = summary_result.summary
            meeting.action_items = [item.dict() for item in summary_result.action_items]
            meeting.metadata = {
                "key_points": summary_result.key_points,
                "participants": summary_result.participants
            }
            meeting.status = MeetingStatus.COMPLETED
            db.commit()
    except Exception as e:
        meeting.status = MeetingStatus.FAILED
        meeting.metadata = {"error": str(e)}
        db.commit()


@router.post("/upload", response_model=MeetingResponse)
async def upload_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Upload meeting audio/video file
    """
    # Validate file type
    if not TranscriptionService.is_audio_file(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = upload_dir / f"{user_id}_{file.filename}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create meeting record
    meeting = Meeting(
        user_id=user_id,
        title=title,
        file_path=str(file_path),
        status=MeetingStatus.UPLOADED
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Process in background
    background_tasks.add_task(process_meeting, meeting.id, db)

    return meeting


@router.post("/transcript", response_model=MeetingResponse)
async def upload_transcript(
    background_tasks: BackgroundTasks,
    data: TranscriptUpload,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Upload meeting transcript directly
    """
    meeting = Meeting(
        user_id=user_id,
        title=data.title,
        transcript=data.transcript,
        status=MeetingStatus.UPLOADED
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Process in background
    background_tasks.add_task(process_meeting, meeting.id, db)

    return meeting


@router.get("/", response_model=List[MeetingResponse])
async def list_meetings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    List all meetings for the authenticated user
    """
    meetings = db.query(Meeting).filter(
        Meeting.user_id == user_id
    ).order_by(Meeting.created_at.desc()).offset(skip).limit(limit).all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Get meeting details
    """
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == user_id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return meeting


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: int,
    data: MeetingUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Update meeting details
    """
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == user_id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if data.title is not None:
        meeting.title = data.title
    if data.transcript is not None:
        meeting.transcript = data.transcript
    
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Delete meeting
    """
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == user_id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Delete file if exists
    if meeting.file_path and os.path.exists(meeting.file_path):
        os.remove(meeting.file_path)
    
    db.delete(meeting)
    db.commit()
    
    return {"message": "Meeting deleted successfully"}


@router.get("/{meeting_id}/export/json")
async def export_meeting_json(
    meeting_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Export meeting as JSON
    """
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == user_id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    meeting_dict = {
        "title": meeting.title,
        "summary": meeting.summary,
        "action_items": meeting.action_items,
        "transcript": meeting.transcript,
        "created_at": meeting.created_at
    }
    
    return ExportService.export_to_json(meeting_dict)


@router.post("/{meeting_id}/export/slack")
async def export_meeting_slack(
    meeting_id: int,
    webhook_url: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Export meeting to Slack
    """
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == user_id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    meeting_dict = {
        "title": meeting.title,
        "summary": meeting.summary,
        "action_items": meeting.action_items
    }
    
    success = await ExportService.export_to_slack(webhook_url, meeting_dict)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to export to Slack")
    
    return {"message": "Successfully exported to Slack"}
