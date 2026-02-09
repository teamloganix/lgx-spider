.PHONY: help build build-backend build-frontend rolling-update rolling-update-frontend rolling-update-backend wait-for-health version version-bump version-bump-patch version-bump-minor version-bump-major version-show _check-image-changed _rolling-update-service check check-backend check-frontend check-fix check-fix-backend check-fix-frontend

COMPOSE_FILE := docker-compose.yml
FRONTEND_SERVICE := frontend
BACKEND_SERVICE := backend
HEALTHCHECK_TIMEOUT := 60
HEALTHCHECK_INTERVAL := 2
VERSION_FILE := VERSION

help:
	@echo "Available targets:"
	@echo "  build                    - Build backend and frontend images"
	@echo "  build-backend            - Build backend image only"
	@echo "  build-frontend           - Build frontend image only"
	@echo "  check                    - Run checks on both frontend and backend"
	@echo "  check-backend            - Run checks on backend only (format, lint, typecheck)"
	@echo "  check-frontend           - Run checks on frontend only (format, lint, typecheck)"
	@echo "  check-fix                - Auto-fix issues in both frontend and backend"
	@echo "  check-fix-backend        - Auto-fix issues in backend only (lint, format)"
	@echo "  check-fix-frontend       - Auto-fix issues in frontend only (lint, format)"
	@echo "  rolling-update           - Perform rolling update (build + update frontend + update backend)"
	@echo "  rolling-update-frontend  - Perform rolling update for frontend only"
	@echo "  rolling-update-backend   - Perform rolling update for backend only"
	@echo "  version                  - Show current version"
	@echo "  version-bump-patch       - Bump patch version (x.x.X)"
	@echo "  version-bump-minor       - Bump minor version (x.X.0)"
	@echo "  version-bump-major       - Bump major version (X.0.0)"

build: build-backend build-frontend

check: check-backend check-frontend
	@echo "All checks completed successfully!"

check-backend:
	@echo "Running backend checks..."
	@cd backend && npm run check

check-frontend:
	@echo "Running frontend checks..."
	@cd frontend && npm run check

check-fix: check-fix-backend check-fix-frontend
	@echo "All auto-fixes completed successfully!"

check-fix-backend:
	@echo "Auto-fixing backend issues..."
	@cd backend && npm run lint:format

check-fix-frontend:
	@echo "Auto-fixing frontend issues..."
	@cd frontend && npm run lint:fix && npm run format:fix

build-backend:
	@echo "Building backend image..."
	docker-compose -f $(COMPOSE_FILE) build $(BACKEND_SERVICE)

build-frontend:
	@echo "Building frontend image..."
	docker-compose -f $(COMPOSE_FILE) build $(FRONTEND_SERVICE)

rolling-update: build rolling-update-frontend rolling-update-backend
	@echo "Rolling update completed successfully!"

rolling-update-frontend: build-frontend
	@echo "Starting rolling update for frontend..."
	@$(MAKE) _rolling-update-service SERVICE=$(FRONTEND_SERVICE)
	@echo "Frontend rolling update completed!"

rolling-update-backend: build-backend
	@echo "Starting rolling update for backend..."
	@$(MAKE) _rolling-update-service SERVICE=$(BACKEND_SERVICE)
	@echo "Backend rolling update completed!"

_check-image-changed:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required"; \
		exit 1; \
	fi
	@COMPOSE_PROJECT_NAME=$$(docker-compose -f $(COMPOSE_FILE) config | grep -E "^name:" | awk '{print $$2}' || basename $$(pwd) | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g'); \
	IMAGE_NAME=$$(docker-compose -f $(COMPOSE_FILE) config | grep -A 5 "^  $(SERVICE):" | grep "image:" | awk '{print $$2}' || echo ""); \
	if [ -z "$$IMAGE_NAME" ]; then \
		IMAGE_NAME="$${COMPOSE_PROJECT_NAME}_$(SERVICE)"; \
	fi; \
	NEW_IMAGE_ID=$$(docker images --format "{{.ID}}" $$IMAGE_NAME:latest 2>/dev/null | head -1 || docker images --format "{{.ID}}" $$IMAGE_NAME 2>/dev/null | head -1 || echo ""); \
	if [ -z "$$NEW_IMAGE_ID" ]; then \
		echo "Warning: Could not find newly built image ($$IMAGE_NAME), proceeding with update..."; \
		echo "changed=true" > /tmp/image_changed_$(SERVICE); \
		exit 0; \
	fi; \
	RUNNING_CONTAINER=$$(docker-compose -f $(COMPOSE_FILE) ps $(SERVICE) -q | head -1 || echo ""); \
	if [ -z "$$RUNNING_CONTAINER" ]; then \
		echo "No running containers found, update needed"; \
		echo "changed=true" > /tmp/image_changed_$(SERVICE); \
		exit 0; \
	fi; \
	OLD_IMAGE_ID=$$(docker inspect --format='{{.Image}}' $$RUNNING_CONTAINER 2>/dev/null | cut -d: -f2 || echo ""); \
	if [ -z "$$OLD_IMAGE_ID" ]; then \
		echo "Could not determine old image ID, proceeding with update..."; \
		echo "changed=true" > /tmp/image_changed_$(SERVICE); \
		exit 0; \
	fi; \
	if [ "$$NEW_IMAGE_ID" = "$$OLD_IMAGE_ID" ]; then \
		echo "Image has not changed (ID: $$NEW_IMAGE_ID), skipping rolling update"; \
		echo "changed=false" > /tmp/image_changed_$(SERVICE); \
	else \
		echo "Image changed (old: $$OLD_IMAGE_ID, new: $$NEW_IMAGE_ID), proceeding with update"; \
		echo "changed=true" > /tmp/image_changed_$(SERVICE); \
	fi

_rolling-update-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required"; \
		exit 1; \
	fi
	@$(MAKE) _check-image-changed SERVICE=$(SERVICE); \
	IMAGE_CHANGED=$$(cat /tmp/image_changed_$(SERVICE) 2>/dev/null | grep "changed=" | cut -d= -f2 || echo "true"); \
	if [ "$$IMAGE_CHANGED" = "false" ]; then \
		echo "Skipping rolling update - no image changes detected"; \
		rm -f /tmp/image_changed_$(SERVICE); \
		exit 0; \
	fi; \
	rm -f /tmp/image_changed_$(SERVICE); \
	echo "Getting current containers for $(SERVICE)..."
	@CONTAINER_LIST=$$(docker-compose -f $(COMPOSE_FILE) ps $(SERVICE) --format "{{.Name}}" 2>/dev/null | grep -v "^$$" | sort || echo ""); \
	if [ -z "$$CONTAINER_LIST" ]; then \
		echo "No running containers found for $(SERVICE). Starting one..."; \
		docker-compose -f $(COMPOSE_FILE) up -d --scale $(SERVICE)=1 $(SERVICE); \
		sleep 5; \
		CONTAINER_LIST=$$(docker-compose -f $(COMPOSE_FILE) ps $(SERVICE) --format "{{.Name}}" 2>/dev/null | grep -v "^$$" | sort); \
	fi; \
	SCALE=$$(echo "$$CONTAINER_LIST" | grep -c . || echo "0"); \
	echo "Found $$SCALE running instance(s)"; \
	if [ "$$SCALE" -eq "0" ]; then \
		echo "Error: No containers found for $(SERVICE)"; \
		exit 1; \
	fi; \
	DESIRED_SCALE=$$SCALE; \
	echo "Container list: $$CONTAINER_LIST"; \
	for CONTAINER_NAME in $$CONTAINER_LIST; do \
		echo ""; \
		echo "========================================="; \
		echo "Updating container: $$CONTAINER_NAME"; \
		echo "========================================="; \
		echo "Stopping and removing container: $$CONTAINER_NAME"; \
		docker stop $$CONTAINER_NAME 2>/dev/null || true; \
		docker rm -f $$CONTAINER_NAME 2>/dev/null || true; \
		echo "Waiting for container to be fully removed..."; \
		sleep 3; \
		echo "Recreating container to maintain scale of $$DESIRED_SCALE..."; \
		docker-compose -f $(COMPOSE_FILE) up -d --no-deps --no-recreate --scale $(SERVICE)=$$DESIRED_SCALE $(SERVICE) 2>&1 | grep -v "WARNING" || true; \
		echo "Waiting for new container to be created and start..."; \
		sleep 10; \
		ALL_CONTAINERS=$$(docker-compose -f $(COMPOSE_FILE) ps $(SERVICE) --format "{{.Name}}" 2>/dev/null | grep -v "^$$" | sort || echo ""); \
		NEW_CONTAINER=""; \
		for C in $$ALL_CONTAINERS; do \
			if ! echo "$$CONTAINER_LIST" | grep -q "^$$C$$"; then \
				NEW_CONTAINER=$$C; \
				break; \
			fi; \
		done; \
		if [ -z "$$NEW_CONTAINER" ]; then \
			NEW_CONTAINER=$$(echo "$$ALL_CONTAINERS" | tail -1 || echo ""); \
		fi; \
		if [ -n "$$NEW_CONTAINER" ]; then \
			echo "Waiting for health check on: $$NEW_CONTAINER"; \
			if ! $(MAKE) wait-for-health SERVICE=$(SERVICE) CONTAINER=$$NEW_CONTAINER; then \
				echo "ERROR: Health check failed for container $$NEW_CONTAINER"; \
				echo "Deployment aborted due to health check failure"; \
				exit 1; \
			fi; \
		else \
			echo "Waiting for health check..."; \
			if ! $(MAKE) wait-for-health SERVICE=$(SERVICE); then \
				echo "ERROR: Health check failed for $(SERVICE)"; \
				echo "Deployment aborted due to health check failure"; \
				exit 1; \
			fi; \
		fi; \
		echo "Container updated successfully"; \
		CONTAINER_LIST=$$(docker-compose -f $(COMPOSE_FILE) ps $(SERVICE) --format "{{.Name}}" 2>/dev/null | grep -v "^$$" | sort || echo ""); \
		sleep 3; \
	done

wait-for-health:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required"; \
		exit 1; \
	fi
	@TIMEOUT=$(HEALTHCHECK_TIMEOUT); \
	ELAPSED=0; \
	while [ $$ELAPSED -lt $$TIMEOUT ]; do \
		if [ -n "$(CONTAINER)" ]; then \
			HEALTH=$$(docker inspect --format='{{.State.Health.Status}}' $(CONTAINER) 2>/dev/null || echo "none"); \
		else \
			HEALTH=$$(docker-compose -f $(COMPOSE_FILE) ps $(SERVICE) --format "{{.Status}}" 2>/dev/null | grep -o "healthy" | head -1 || echo "none"); \
			if [ -z "$$HEALTH" ]; then HEALTH="none"; fi; \
		fi; \
		if [ "$$HEALTH" = "healthy" ]; then \
			echo "Health check passed!"; \
			exit 0; \
		fi; \
		echo "Waiting for health check... ($$ELAPSED/$$TIMEOUT seconds, status: $$HEALTH)"; \
		sleep $(HEALTHCHECK_INTERVAL); \
		ELAPSED=$$((ELAPSED + $(HEALTHCHECK_INTERVAL))); \
	done; \
	echo "Health check timeout reached"; \
	exit 1

version-show:
	@if [ -f "$(VERSION_FILE)" ]; then \
		echo "Current version: $$(cat $(VERSION_FILE))"; \
	else \
		echo "VERSION file not found. Current version: 0.0.0"; \
	fi

version-bump-patch:
	@./scripts/bump-version.sh patch

version-bump-minor:
	@./scripts/bump-version.sh minor

version-bump-major:
	@./scripts/bump-version.sh major

version: version-show

