# docker/ollama/Dockerfile

# Use the official Ollama image as the base
FROM ollama/ollama

# Copy our custom initialization script into the image
COPY init-ollama.sh /init-ollama.sh

# Make the script executable
RUN chmod +x /init-ollama.sh

# Set our script as the entrypoint. It will run when the container starts.
ENTRYPOINT ["/init-ollama.sh"]

# Set the default model to pull. This can be overridden in docker-compose.yml.
CMD ["llama3"]