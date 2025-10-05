import openai
from pathlib import Path
from ..core.config import settings

openai.api_key = settings.OPENAI_API_KEY


class TranscriptionService:
    @staticmethod
    async def transcribe_audio(file_path: str) -> str:
        """
        Transcribe audio file using OpenAI Whisper API
        """
        try:
            with open(file_path, "rb") as audio_file:
                transcript = openai.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            return transcript
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")

    @staticmethod
    def is_audio_file(filename: str) -> bool:
        """
        Check if file is a supported audio/video format
        """
        audio_extensions = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}
        return Path(filename).suffix.lower() in audio_extensions
