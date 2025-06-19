#!/bin/sh
# Pull llama3 model
ollama pull llama3

# Start Ollama server
exec ollama serve