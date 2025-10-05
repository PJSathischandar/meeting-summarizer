.PHONY: help install setup up down logs clean migrate-create migrate-up migrate-down backend-shell frontend-shell db-shell test

help:
	@echo "Meeting Summarizer - Available Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install       - Install all dependencies"
	@echo "  make setup         - Initial setup with Docker"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make logs          - View logs from all services"
	@echo "  make clean         - Remove all containers and volumes"
	@echo ""
	@echo "Database Commands:"
	@echo "  make migrate-create MSG='message' - Create new migration"
	@echo "  make migrate-up    - Run database migrations"
	@echo "  make migrate-down  - Rollback last migration"
	@echo "  make db-shell      - Connect to database shell"
	@echo ""
	@echo "Shell Access:"
	@echo "  make backend-shell - Access backend container shell"
	@echo "  make frontend-shell - Access frontend container shell"
	@echo ""
	@echo "Testing:"
	@echo "  make test          - Run all tests"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Dependencies installed"

setup:
	@echo "Running setup script..."
	./setup.sh

up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "✅ Services started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

down:
	@echo "Stopping services..."
	docker-compose down
	@echo "✅ Services stopped"

logs:
	docker-compose logs -f

clean:
	@echo "Cleaning up..."
	docker-compose down -v
	@echo "✅ Cleanup complete"

migrate-create:
	@if [ -z "$(MSG)" ]; then \
		echo "Error: Please provide a migration message with MSG='message'"; \
		exit 1; \
	fi
	cd backend && alembic revision --autogenerate -m "$(MSG)"

migrate-up:
	cd backend && alembic upgrade head

migrate-down:
	cd backend && alembic downgrade -1

backend-shell:
	docker-compose exec backend /bin/bash

frontend-shell:
	docker-compose exec frontend /bin/sh

db-shell:
	docker-compose exec postgres psql -U postgres -d meeting_summarizer

test:
	@echo "Running backend tests..."
	cd backend && pytest
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "✅ All tests passed"
