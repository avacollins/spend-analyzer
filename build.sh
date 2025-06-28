#!/bin/bash

# Build script for Political Ad Spend Analyzer

echo "🚀 Building Political Ad Spend Analyzer..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t spend-analyzer:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "🐳 To run the container:"
    echo "   docker run -p 3000:3000 spend-analyzer:latest"
    echo ""
    echo "🔗 Or use Docker Compose:"
    echo "   docker-compose up"
    echo ""
    echo "🌐 The application will be available at http://localhost:3000"
else
    echo "❌ Docker build failed!"
    exit 1
fi
