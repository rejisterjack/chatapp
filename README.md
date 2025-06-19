# PDF Chat Assistant

A modern web application that allows users to upload PDF files and engage in conversations about their content using Llama3 AI.

## Features

- 🚀 Real-time chat interface
- 📄 PDF file upload and processing
- 🤖 AI-powered responses using Llama3
- 🎨 Modern UI with Tailwind CSS
- ⚡ High-performance backend with Bun & Elysia
- 🔒 Secure file handling
- 📱 Responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- SWR for data fetching
- React Markdown for message rendering

### Backend
- Bun runtime
- Elysia.js framework
- LangChain for AI integration
- PDF Parser for document processing

### Infrastructure
- Docker for containerization
- Nginx for frontend serving
- Docker Compose for orchestration

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Bun runtime (for backend development)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/rejisterjack/chatapp.git
cd chatapp
```

2. Install dependencies:
```bash
# Frontend
cd client
bun install

# Backend
cd ../server
bun install
```

3. Start development servers:
```bash
# Frontend (in client directory)
bun run dev

# Backend (in server directory)
bun run dev
```

### Running with Docker

Build and run the entire application stack:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- API Documentation: http://localhost:8080/docs

## API Endpoints

### `GET /`
- Health check endpoint
- Returns: `{ "status": "ok" }`

### `POST /api/upload`
- Uploads and processes PDF files
- Maximum file size: 10MB
- Accepts: `multipart/form-data`
- Returns: Upload confirmation with content preview

### `POST /api/chat`
- Sends messages to the chatbot
- Accepts: JSON with `message` and `conversationId`
- Returns: AI response

## Environment Variables

### Frontend
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8080)

### Backend
- `PORT`: Server port (default: 8080)
- `OLLAMA_HOST`: Ollama service URL (for Docker setup)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details