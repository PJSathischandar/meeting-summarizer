# Development Guide

## Architecture Overview

### Backend (FastAPI)

The backend is built with FastAPI and follows a layered architecture:

```
backend/
├── app/
│   ├── api/          # API routes and endpoints
│   ├── core/         # Configuration and database setup
│   ├── models/       # SQLAlchemy ORM models
│   ├── schemas/      # Pydantic schemas for validation
│   └── services/     # Business logic layer
```

#### Key Components

**API Layer** (`app/api/`):
- `meetings.py`: Handles meeting upload, processing, and retrieval
- `stripe.py`: Manages billing and subscription workflows

**Services Layer** (`app/services/`):
- `transcription.py`: OpenAI Whisper integration for audio transcription
- `summarization.py`: GPT-4o integration for meeting summarization
- `auth.py`: Clerk authentication verification
- `export.py`: Export functionality for JSON, Slack, and email

**Models** (`app/models/`):
- `meeting.py`: Database schema for meetings

### Frontend (Next.js)

The frontend uses Next.js 14 with the App Router:

```
frontend/
├── app/              # Next.js pages
│   ├── dashboard/    # Meeting dashboard
│   ├── meetings/     # Meeting detail views
│   └── pricing/      # Pricing and subscription
├── components/       # Reusable React components
└── lib/             # API client and utilities
```

#### Key Features

- **Authentication**: Clerk integration with middleware protection
- **State Management**: React hooks for local state
- **API Communication**: Axios-based API client in `lib/api.ts`
- **Styling**: Tailwind CSS with custom design system

## Development Workflow

### Setting Up Local Environment

1. **Install Dependencies**

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
npm install
```

2. **Configure Environment Variables**

Copy `.env.example` files and fill in your API keys:
- OpenAI API key for transcription and summarization
- Clerk keys for authentication
- Stripe keys for billing
- PostgreSQL connection string

3. **Run Database Migrations**

```bash
cd backend
alembic upgrade head
```

4. **Start Development Servers**

Backend:
```bash
cd backend
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm run dev
```

### Making Changes

#### Adding a New API Endpoint

1. Create/update route in `backend/app/api/`
2. Add necessary schemas in `backend/app/schemas/`
3. Implement business logic in `backend/app/services/`
4. Update API client in `frontend/lib/api.ts`

#### Adding a New Frontend Page

1. Create page component in `frontend/app/`
2. Add necessary components in `frontend/components/`
3. Update navigation in `frontend/components/layout/Navbar.tsx`

#### Database Changes

1. Modify models in `backend/app/models/`
2. Generate migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "description"
   ```
3. Review and apply migration:
   ```bash
   alembic upgrade head
   ```

## Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm test
```

## API Endpoints

### Meetings

- `POST /api/meetings/upload` - Upload audio/video file
- `POST /api/meetings/transcript` - Upload text transcript
- `GET /api/meetings/` - List all meetings
- `GET /api/meetings/{id}` - Get meeting details
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `GET /api/meetings/{id}/export/json` - Export as JSON
- `POST /api/meetings/{id}/export/slack` - Export to Slack

### Billing

- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/create-portal-session` - Create customer portal
- `POST /api/billing/webhook` - Handle Stripe webhooks

## Common Development Tasks

### Adding a New Feature

1. **Backend**: Implement API endpoint and business logic
2. **Frontend**: Create UI components and integrate with API
3. **Testing**: Add tests for both backend and frontend
4. **Documentation**: Update README and API docs

### Debugging

**Backend Logs**:
```bash
# View FastAPI logs
docker-compose logs -f backend
```

**Frontend Logs**:
```bash
# View Next.js logs
docker-compose logs -f frontend
```

**Database Access**:
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d meeting_summarizer
```

### Performance Optimization

- Use background tasks for long-running operations
- Implement caching for frequently accessed data
- Optimize database queries with proper indexing
- Use pagination for large datasets

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set proper CORS origins
- [ ] Configure production database
- [ ] Set up Stripe webhook endpoint
- [ ] Enable HTTPS/SSL
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all features in production environment

## Troubleshooting

### Common Issues

**Database Connection Error**:
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify credentials

**OpenAI API Error**:
- Verify OPENAI_API_KEY is set
- Check API quota and billing
- Ensure correct model names

**Authentication Error**:
- Verify Clerk keys are correct
- Check token expiration
- Ensure middleware is configured

**File Upload Issues**:
- Check UPLOAD_DIR permissions
- Verify MAX_UPLOAD_SIZE setting
- Ensure disk space is available

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
