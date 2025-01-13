# Variables
PROJECT_DIR := $(shell pwd)

.PHONY: init backend frontend docker-up docker-down clean

init:
	@echo "Initializing project..."
	(cd backend && npm install)
	(cd frontend && npm install)

backend:
	@echo "Starting backend..."
	cd backend && npm start

frontend:
	@echo "Starting frontend..."
	cd frontend && npm start

docker-up:
	@echo "Starting Docker services..."
	docker-compose up --build -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

clean:
	@echo "Cleaning up..."
	rm -rf backend/node_modules frontend/node_modules
	docker-compose down -v
