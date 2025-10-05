# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                   (Next.js 14 + React)                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Landing  │  │Dashboard │  │ Meeting  │  │ Pricing  │  │
│  │   Page   │  │   Page   │  │  Detail  │  │   Page   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Authentication (Clerk)                     │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                        Backend                              │
│                  (FastAPI + Python)                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Meeting  │  │ Billing  │  │  Auth    │  │  Export  │  │
│  │   API    │  │   API    │  │Middleware│  │ Services │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Business Logic Services                  │   │
│  │  • Transcription (OpenAI Whisper)                  │   │
│  │  • Summarization (GPT-4o)                          │   │
│  │  • Export (JSON/Slack/Email)                       │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ SQLAlchemy ORM
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                      Database                               │
│                    (PostgreSQL)                             │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Meetings Table                                     │   │
│  │  • ID, User ID, Title                               │   │
│  │  • Transcript, Summary, Action Items                │   │
│  │  • Status, Timestamps, Metadata                     │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   OpenAI     │  │    Clerk     │  │    Stripe    │
│ (Whisper +   │  │(Auth & User  │  │  (Billing)   │
│   GPT-4o)    │  │  Management) │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

### Meeting Upload and Processing

```
User Upload → Frontend → Backend API
                           │
                           ├→ Save to Database (status: uploaded)
                           │
                           ├→ Background Task:
                           │   │
                           │   ├→ Transcribe (if audio/video)
                           │   │  ├→ OpenAI Whisper API
                           │   │  └→ Update DB (status: transcribing)
                           │   │
                           │   ├→ Summarize
                           │   │  ├→ GPT-4o API
                           │   │  └→ Update DB (status: summarizing)
                           │   │
                           │   └→ Complete
                           │      └→ Update DB (status: completed)
                           │
                           └→ Return Meeting ID to Frontend
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **HTTP Client**: Axios
- **UI Components**: Custom components with Lucide icons
- **File Upload**: React Dropzone

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: Clerk JWT verification
- **AI Services**: OpenAI (Whisper, GPT-4o)
- **Payment**: Stripe
- **Async**: Python asyncio

### Database
- **RDBMS**: PostgreSQL 15+
- **Schema Management**: Alembic migrations
- **Connection Pool**: SQLAlchemy engine

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Uvicorn (ASGI)
- **Reverse Proxy**: (Optional) Nginx

## API Endpoints

### Meetings API (`/api/meetings/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload audio/video file |
| POST | `/transcript` | Upload text transcript |
| GET | `/` | List all meetings |
| GET | `/{id}` | Get meeting details |
| PUT | `/{id}` | Update meeting |
| DELETE | `/{id}` | Delete meeting |
| GET | `/{id}/export/json` | Export as JSON |
| POST | `/{id}/export/slack` | Export to Slack |

### Billing API (`/api/billing/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-checkout-session` | Create Stripe checkout |
| POST | `/create-portal-session` | Create customer portal |
| POST | `/webhook` | Handle Stripe webhooks |

## Database Schema

### Meetings Table

```sql
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    file_path VARCHAR,
    transcript TEXT,
    summary TEXT,
    action_items JSON,
    status ENUM('uploaded', 'transcribing', 'summarizing', 'completed', 'failed'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    metadata JSON
);

CREATE INDEX idx_meetings_user_id ON meetings(user_id);
```

## Security

### Authentication Flow

1. User signs in via Clerk (frontend)
2. Clerk issues JWT token
3. Frontend includes token in API requests
4. Backend verifies token with Clerk API
5. Extract user_id from verified token
6. Use user_id for data access control

### Data Access Control

- All API endpoints require authentication
- Users can only access their own meetings
- User ID extracted from JWT token
- Database queries filtered by user_id

### API Security

- CORS configured for frontend origin only
- HTTPS enforced in production
- Rate limiting (recommended for production)
- Input validation with Pydantic
- SQL injection protection via ORM
- File upload size limits

## Scalability Considerations

### Current Architecture
- Synchronous processing in background tasks
- Single database instance
- File storage on local filesystem

### Future Improvements
1. **Message Queue**: Add Celery/RabbitMQ for async processing
2. **Object Storage**: Use S3/GCS for file uploads
3. **Caching**: Add Redis for session/data caching
4. **CDN**: CloudFront/CloudFlare for static assets
5. **Database**: Read replicas for scaling reads
6. **Load Balancer**: Multiple backend instances
7. **Monitoring**: Prometheus + Grafana
8. **Logging**: ELK stack or similar

## Deployment Options

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Cloud Platforms

**Frontend (Vercel)**
- Next.js optimized platform
- Automatic deployments from Git
- Edge network CDN

**Backend (Railway/Render/Fly.io)**
- Container-based deployment
- PostgreSQL add-on
- Environment variable management

**Database (Supabase/Neon)**
- Managed PostgreSQL
- Automatic backups
- Connection pooling

### Self-Hosted
- VM/VPS with Docker
- Nginx reverse proxy
- SSL via Let's Encrypt
- Monitoring via Netdata

## Performance Optimization

### Backend
- Background tasks for long operations
- Database connection pooling
- Query optimization with indexes
- Caching frequently accessed data

### Frontend
- Next.js automatic code splitting
- Image optimization
- Static generation where possible
- Client-side caching

### AI API Costs
- Whisper: ~$0.006 per minute
- GPT-4o: ~$0.03 per 1K tokens
- Average meeting: $0.01-0.05

## Monitoring & Observability

### Metrics to Track
- API response times
- Error rates
- Database query performance
- AI API usage and costs
- User signup/login rates
- Meeting processing times

### Logging
- Application logs (INFO, ERROR)
- API access logs
- Background task logs
- Error tracking (Sentry recommended)

## Backup & Recovery

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Backup retention policy

### File Uploads
- Redundant storage
- Periodic sync to cloud storage
- Disaster recovery plan

## Development Workflow

1. Local development with Docker Compose
2. Feature branches from `main`
3. Pull requests with code review
4. CI/CD pipeline (GitHub Actions)
5. Staging environment testing
6. Production deployment

## Testing Strategy

### Backend Tests
- Unit tests for services
- Integration tests for API endpoints
- Database migration tests

### Frontend Tests
- Component tests (Jest)
- E2E tests (Playwright)
- Visual regression tests

## Cost Estimation

### Monthly Costs (100 meetings)
- OpenAI API: $1-5
- Clerk: Free tier
- Stripe: Free (% on transactions)
- Hosting: $10-50
- Database: $10-25

**Total**: ~$20-80/month for moderate usage
