# docker/ollama/init-ollama.sh

#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status.

# The model to pull is passed as the first argument to this script
MODEL_NAME=${1:-"llama3"} # Default to "llama3" if no argument is provided

echo "Starting Ollama server in the background..."
/bin/ollama serve &
# Capture the process ID of the server
PID=$!

echo "Waiting for Ollama server to be ready..."
while ! curl -s -f http://localhost:11434 > /dev/null
do
  echo "Ollama not ready yet, waiting 1 second..."
  sleep 1
done
echo "Ollama server is up and running."

# Check if the model already exists
if ollama list | grep -q "$MODEL_NAME"; then
  echo "Model '$MODEL_NAME' already exists. Skipping pull."
else
  echo "Model '$MODEL_NAME' not found. Pulling now..."
  ollama pull "$MODEL_NAME"
  echo "Model '$MODEL_NAME' pulled successfully."
fi

# Wait for the Ollama server process to exit
# This ensures the container stays running and allows for graceful shutdown
wait $PID