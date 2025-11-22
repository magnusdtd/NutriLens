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


 # Start Multi-agent System
.PHONY: multi-agent-system-up
multi-agent-system-up:
	@echo "Starting Multi-agent system"
	@docker compose -f docker-compose.yml up -d

# Stop Multi-agent System
.PHONY: multi-agent-system-down
multi-agent-system-down: 
	@echo "Stopping Multi-agent system"
	@docker compose -f docker-compose.yml down


 # Start Langfuse
.PHONY: langfuse-up
langfuse-up:
	@echo "Starting Langfuse…"
	@docker compose -f docker-compose.langfuse.yml up -d

# Stop Langfuse
.PHONY: langfuse-down
langfuse-down: 
	@echo "Stopping Langfuse…"
	@docker compose -f docker-compose.langfuse.yml down


 # Start Mlflow 
.PHONY: mlflow-up
mlflow-up:
	@echo "Starting Mlflow…"
	@cd mlflow && docker compose -f docker-compose.yml up -d

# Stop Mlflow 
.PHONY: mlflow-down
mlflow-down: 
	@echo "Stopping Mlflow…"
	@cd mlflow && docker compose -f docker-compose.yml down


 # Start CDC (Debezium + Kafka)
.PHONY: cdc-up
cdc-up:
	@echo "Starting CDC (Debezium + Kafka)…"
	@cd cdc && docker compose -f docker-compose.yml up -d

# Stop CDC (Debezium + Kafka)
.PHONY: cdc-down
cdc-down: 
	@echo "Stopping CDC (Debezium + Kafka)…"
	@cd cdc && docker compose -f docker-compose.yml down


# Stop all infrastructure services
.PHONY: infra-down
infra-down:
	@echo "Stopping all infrastructure services …"
	@docker compose -f docker-compose.yml down -v
	@cd mlflow && docker compose -f docker-compose.yml down -v
	@docker compose -f docker-compose.langfuse.yml down -v
	@cd cdc && docker compose -f docker-compose.yml down -v