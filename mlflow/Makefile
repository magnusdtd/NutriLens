.DEFAULT_GOAL := help

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@grep -E '^\.[PHONY]+: [a-zA-Z0-9_-]+.*$$' $(MAKEFILE_LIST) | awk '{print "  make " $$2}'

# Remove Python cache files and directories
.PHONY: clean
clean: 
	@echo "Removing all __pycache__ directories and .pyc files…"
	@find . -type d -name "__pycache__" -exec rm -rf {} +
	@find . -type f -name "*.pyc" -delete

 # Start Mlflow services
.PHONY: mlflow-up
mlflow-up:
	@echo "Starting Mlflow services…"
	@chmod +x mlflow
	@docker compose -f docker-compose.yml up -d

# Stop Mlflow services
.PHONY: mlflow-down
mlflow-down: 
	@echo "Stopping Mlflow services…"
	@docker compose -f docker-compose.yml down

# Show logs of Mlflow services
.PHONY: mlflow-logs
mlflow-logs: 
	@echo "Showing logs of Mlflow services…"
	@docker compose -f docker-compose.yml logs -f

# Start Jenkins server
.PHONY: jenkins-up
jenkins-up: 
	@echo "Starting Jenkins service…"
	@docker compose -f jenkins/docker-compose.yaml up -d

# Stop Jenkins server
.PHONY: jenkins-down
jenkins-down:
	@echo "Stopping Jenkins service…"
	@docker compose -f jenkins/docker-compose.yaml down

# Stop all infrastructure services
.PHONY: infra-down
infra-down: 
	@echo "Stopping all infrastructure services …"
	@docker compose -f docker-compose.yml down -v
	@docker compose -f jenkins/docker-compose.yaml down -v
