# Build stage with Bun
FROM oven/bun:1.1-slim AS builder
WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage (same as before)
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]