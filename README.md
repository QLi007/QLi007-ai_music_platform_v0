
# AI Music Platform v0

## Introduction
AI Music Platform is a simple web application where users can create and share AI-generated music.

## Features
- AI music generation (placeholder in v1)
- Music sharing and listening functionality
- User authentication and profile management

## Technologies Used
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose

## How to Run Locally
1. Initialize the project by installing dependencies:
   ```bash
   make init
   ```
2. Start the backend and frontend locally:
   ```bash
   make backend
   make frontend
   ```
3. To run using Docker:
   ```bash
   make docker-up
   ```

## How to Run Tests
```bash
make backend
npm test
```

## Deployment
Refer to the CI/CD pipeline section in the documentation for automated deployment.

## Notes
- Ensure Docker is installed and running before starting the deployment.
- For better scalability, consider using a cloud-based MongoDB instance like MongoDB Atlas.
