FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[full]"

# Copy source
COPY src/ ./src/
COPY examples/ ./examples/

# Expose port for API
EXPOSE 8000

# Default command
CMD ["python", "-m", "uvicorn", "evoforge.api:app", "--host", "0.0.0.0", "--port", "8000"]