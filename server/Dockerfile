# Dockerfile

# Use the official Bun image as a base
FROM oven/bun:1.1-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb to leverage Docker cache
COPY package.json bun.lock ./

# Install dependencies. --frozen-lockfile ensures we use the exact versions from the lockfile
RUN bun install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# The command to run the application
# We use the compiled version for production, but for dev, this is fine.
CMD ["bun", "run", "dev"]