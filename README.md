# Meeting Summarizer

AI-powered application to summarize meetings and create straightforward action plans to maximize productivity and reduce time spent trying to remember boring meetings.

## Features

- 🎙️ **Audio/Video Transcription**: Upload meeting recordings and get automatic transcription using OpenAI Whisper
- 📝 **AI-Powered Summaries**: Generate concise summaries with GPT-4o
- ✅ **Action Item Extraction**: Automatically extract action items with assignees and priorities
- 📊 **Dashboard**: View all your meetings and their summaries in one place
- 📤 **Export Options**: Export summaries to JSON, Slack, or Email
- 🔐 **Authentication**: Secure authentication with Clerk
- 💳 **Billing**: Subscription management with Stripe

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Clerk**: Authentication and user management
- **Stripe**: Payment and subscription management

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Robust relational database
- **SQLAlchemy**: SQL toolkit and ORM
- **OpenAI APIs**: Whisper for transcription, GPT-4o for summarization
- **Alembic**: Database migrations

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- OR: Python 3.11+, Node.js 20+, PostgreSQL 15+

### Environment Variables

1. Copy the example environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Fill in the required API keys and credentials:

**Backend (.env)**:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `CLERK_SECRET_KEY`: Clerk secret key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `SECRET_KEY`: Random secret key for JWT

**Frontend (.env.local)**:
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:8000)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

### Running with Docker (Recommended)

1. Create a `.env` file in the root directory with all required environment variables

2. Start all services:

```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Running Locally

#### Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run database migrations:

```bash
alembic upgrade head
```

5. Start the server:

```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `POST /api/meetings/upload`: Upload audio/video file
- `POST /api/meetings/transcript`: Upload text transcript
- `GET /api/meetings/`: List all meetings
- `GET /api/meetings/{id}`: Get meeting details
- `GET /api/meetings/{id}/export/json`: Export meeting as JSON
- `POST /api/meetings/{id}/export/slack`: Export meeting to Slack
- `POST /api/billing/create-checkout-session`: Create Stripe checkout

## Project Structure

```
meeting-summarizer/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core configuration
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI application
│   ├── alembic/          # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js app directory
│   │   ├── dashboard/    # Dashboard page
│   │   ├── meetings/     # Meeting detail pages
│   │   └── pricing/      # Pricing page
│   ├── components/       # React components
│   ├── lib/              # Utilities and API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Usage

1. **Sign Up**: Create an account using Clerk authentication
2. **Upload Meeting**: Click "New Meeting" and either:
   - Upload an audio/video file (MP3, MP4, WAV, M4A, WebM)
   - Paste a transcript directly
3. **Processing**: The system will:
   - Transcribe the audio (if applicable)
   - Generate a summary using GPT-4o
   - Extract action items and key points
4. **View Results**: Access your meeting summary, action items, and full transcript
5. **Export**: Download as JSON or share to Slack

## Deployment

### Environment Variables for Production

Update the following for production:
- Set `BACKEND_CORS_ORIGINS` to your frontend URL
- Use production database URL
- Update Stripe webhook endpoint
- Configure proper secrets and keys

### Database Migrations

Run migrations in production:

```bash
cd backend
alembic upgrade head
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.