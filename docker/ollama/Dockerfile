FROM ollama/ollama:latest
COPY init-ollama.sh /usr/bin/init-ollama.sh
RUN chmod +x /usr/bin/init-ollama.sh
ENTRYPOINT ["/usr/bin/init-ollama.sh"]