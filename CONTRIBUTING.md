# Contributing to Meeting Summarizer

Thank you for your interest in contributing to Meeting Summarizer! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the project and community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Python version, Node version, etc.)
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- A clear description of the proposed feature
- Use cases and benefits
- Any implementation ideas you may have

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`

2. **Set up your development environment**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meeting-summarizer.git
   cd meeting-summarizer
   make install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes
   - `Test:` for test additions/updates

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Guidelines

### Backend (FastAPI)

- Follow PEP 8 style guidelines
- Use type hints for function parameters and returns
- Write docstrings for all functions and classes
- Keep functions focused and single-purpose
- Add tests for new endpoints and business logic

Example:
```python
async def process_meeting(meeting_id: int, db: Session) -> Meeting:
    """
    Process a meeting by transcribing and summarizing.
    
    Args:
        meeting_id: The ID of the meeting to process
        db: Database session
        
    Returns:
        The processed meeting object
        
    Raises:
        Exception: If processing fails
    """
    # Implementation
```

### Frontend (Next.js)

- Use TypeScript for type safety
- Follow React hooks best practices
- Keep components small and reusable
- Use Tailwind CSS for styling
- Write meaningful component names

Example:
```tsx
interface MeetingCardProps {
  meeting: Meeting
  onClick: (id: number) => void
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  // Implementation
}
```

### Database Migrations

When making database changes:

1. Update models in `backend/app/models/`
2. Generate migration:
   ```bash
   make migrate-create MSG="description"
   ```
3. Review the generated migration file
4. Test the migration locally
5. Include migration in your PR

### Testing

- Add unit tests for new functions
- Add integration tests for API endpoints
- Test edge cases and error conditions
- Ensure all tests pass before submitting PR

Run tests:
```bash
make test
```

### Documentation

- Update README.md if adding major features
- Update API documentation for new endpoints
- Add inline comments for complex logic
- Update DEVELOPMENT.md for new development workflows

## Project Structure

```
meeting-summarizer/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Configuration
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   └── alembic/         # Database migrations
├── frontend/            # Next.js frontend
│   ├── app/            # Pages
│   ├── components/     # React components
│   └── lib/            # Utilities
└── docs/               # Documentation
```

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).
