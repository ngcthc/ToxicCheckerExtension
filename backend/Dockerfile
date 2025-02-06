FROM python:3.9-slim

# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     gcc \
#     libffi-dev \
#     build-essential \
#     curl \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files
# COPY . .
COPY . /app

# Create writable cache directory
RUN mkdir -p /app/cache
RUN chmod -R 777 /app/cache
ENV TRANSFORMERS_CACHE=/app/cache

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI app
CMD ["python", "main.py"]

