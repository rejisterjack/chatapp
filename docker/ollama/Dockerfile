FROM ollama/ollama:latest

# Install curl for health checks (Ubuntu version)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy initialization script
COPY init-ollama.sh /usr/bin/init-ollama.sh
RUN chmod +x /usr/bin/init-ollama.sh

# Start script
ENTRYPOINT ["/usr/bin/init-ollama.sh"]