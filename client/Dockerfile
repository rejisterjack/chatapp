# Base image with Bun
FROM oven/bun:1.1.13-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY bun.lock package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Vite app
RUN bun run build

# Expose the default preview port
EXPOSE 5173

# Serve the built app using Vite's preview server
CMD ["bun", "run", "preview"]
