#!/bin/bash

echo "==================================="
echo "Meeting Summarizer Setup Script"
echo "==================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from examples..."
    
    # Create .env file from examples
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/meeting_summarizer

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Clerk Authentication
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# App Settings
SECRET_KEY=$(openssl rand -hex 32)
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
NEXT_PUBLIC_API_URL=http://localhost:8000

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=104857600
EOF

    echo "✅ Created .env file with default values"
    echo "⚠️  Please update .env file with your actual API keys before continuing"
    echo ""
    echo "Required API keys:"
    echo "  - OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
    echo "  - CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY (from https://clerk.com)"
    echo "  - STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY (from https://stripe.com)"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

echo "📦 Building Docker containers..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Setup complete!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
