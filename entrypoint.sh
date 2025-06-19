#!/usr/bin/env bash
set -e

# Start Ollama server in background
ollama serve &
pid=$!

# Wait until Ollama is ready
until ollama list >/dev/null 2>&1; do
  echo "Waiting for Ollama to start..."
  sleep 1
done

# Pull model if not present
echo "Pulling llama3 model..."
ollama pull llama3

# Keep the server running
wait $pid
