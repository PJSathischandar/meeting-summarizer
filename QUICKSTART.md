# Quick Start Guide

Get your Meeting Summarizer app running in 5 minutes!

## Prerequisites

Choose one of these options:

**Option 1: Docker (Recommended)**
- Docker Desktop or Docker Engine installed
- Docker Compose installed

**Option 2: Local Development**
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

## Step 1: Get API Keys

You'll need the following API keys:

1. **OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Navigate to API Keys section
   - Create new secret key
   - Cost: ~$0.01 per minute of audio transcription, ~$0.03 per meeting summary

2. **Clerk Account**
   - Sign up at https://clerk.com
   - Create a new application
   - Get your Publishable Key and Secret Key
   - Free tier: Up to 10,000 monthly active users

3. **Stripe Account** (Optional for billing)
   - Sign up at https://stripe.com
   - Get your test keys from the Developers section
   - Free for testing

## Step 2: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/PJSathischandar/meeting-summarizer.git
cd meeting-summarizer

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Create a `.env` file from examples
- Build Docker containers
- Start all services

## Step 3: Configure Environment Variables

Edit the `.env` file created in the root directory:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Required: Clerk Authentication
CLERK_SECRET_KEY=sk_test_your-actual-clerk-secret-key
CLERK_PUBLISHABLE_KEY=pk_test_your-actual-clerk-publishable-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-clerk-publishable-key

# Optional: Stripe (if you want billing)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Auto-generated (don't change unless needed)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/meeting_summarizer
SECRET_KEY=auto-generated-secret-key
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Step 4: Start the Application

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Using Local Development

**Terminal 1 - Database:**
```bash
# Start PostgreSQL (if not running)
# On macOS with Homebrew:
brew services start postgresql@15

# Or use Docker just for database:
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=meeting_summarizer \
  -p 5432:5432 postgres:15-alpine
```

**Terminal 2 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Step 5: Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Step 6: Create Your First Meeting Summary

1. Click **"Sign Up"** to create an account (uses Clerk)
2. Click **"New Meeting"** on the dashboard
3. Either:
   - Upload an audio/video file (MP3, MP4, WAV, etc.)
   - OR paste a meeting transcript
4. Wait for processing (transcription + summarization)
5. View your AI-generated summary and action items!

## Troubleshooting

### Services won't start

```bash
# Stop all services
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Can't connect to database

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U postgres -d meeting_summarizer
```

### OpenAI API errors

- Verify your API key is correct in `.env`
- Check your OpenAI account has available credits
- Ensure you have access to GPT-4o (may require paid account)

### Clerk authentication issues

- Verify both keys are set in `.env`
- Check Clerk dashboard for any configuration issues
- Ensure CORS origins are configured correctly in Clerk

### Frontend build errors

```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm install
npm run dev
```

## Next Steps

- Read the [full README](README.md) for detailed documentation
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Common Commands

```bash
# Start services
make up

# Stop services
make down

# View logs
make logs

# Run database migrations
make migrate-up

# Access backend shell
make backend-shell

# Access database
make db-shell

# See all commands
make help
```

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker-compose logs -f`
3. Open an issue on GitHub with details

## Costs

Using this application with default settings:

- **OpenAI API**: ~$0.01-0.05 per meeting (depending on length)
- **Clerk**: Free tier covers most use cases
- **Stripe**: Free (only charges on actual payments)
- **Hosting**: Varies by provider (can run on free tiers initially)

**Estimated monthly cost for 100 meetings**: ~$1-5 in OpenAI credits

Enjoy your AI-powered meeting summaries! 🎉
