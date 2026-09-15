DOCKER ?= $(shell which docker 2>/dev/null || which podman 2>/dev/null)

.PHONY: help setup up down restart destroy logs dev run test lint lint-fix migrate fresh seed build wayfinder horizon clean

help: ## Show this help menu
	@echo "\033[36m=====================================================\033[0m"
	@echo "\033[1;32m  Laravel Todo App - Developer Command Palette\033[0m"
	@echo "\033[36m=====================================================\033[0m"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[33m%-18s\033[0m %s\n", $$1, $$2}'

setup: ## Initial project setup (install dependencies, generate keys, link storage, migrate & seed)
	@composer install
	@cp -n .env.example .env || true
	@php artisan key:generate
	@php artisan storage:link || true
	@php artisan migrate:fresh --seed
	@npm install
	@npm run build
	@php artisan wayfinder:generate

up: up-dev ## Alias for up-dev
down: down-dev ## Alias for down-dev
restart: restart-dev ## Alias for restart-dev

up-dev: ## Start Docker development containers (MySQL, Redis, Mailpit, RustFS)
	@$(DOCKER) compose -f compose.dev.yml up -d

down-dev: ## Stop Docker development containers
	@$(DOCKER) compose -f compose.dev.yml down

destroy-dev: ## Stop Docker containers and delete volumes
	@$(DOCKER) compose -f compose.dev.yml down -v

restart-dev: ## Restart Docker development containers
	@$(DOCKER) compose -f compose.dev.yml restart

logs: ## Tail Docker container logs
	@$(DOCKER) compose -f compose.dev.yml logs -f

dev: run ## Alias for run

run: ## Start local dev servers (Laravel + Vite concurrent processes)
	@composer run dev

migrate: ## Run pending database migrations
	@php artisan migrate

fresh: ## Reset database and seed demo data (migrate:fresh --seed)
	@php artisan migrate:fresh --seed

seed: ## Run database seeders
	@php artisan db:seed

test: ## Run Pest feature and unit test suite
	@php artisan test --compact

lint: ## Format PHP code using Laravel Pint
	@vendor/bin/pint --format agent

build: ## Build frontend assets for production
	@npm run build

wayfinder: ## Generate Wayfinder TypeScript functions for routes & actions
	@php artisan wayfinder:generate

horizon: ## Start Laravel Horizon queue worker monitoring
	@php artisan horizon


clean: ## Clear all application caches (config, route, view, cache)
	@php artisan config:clear
	@php artisan route:clear
	@php artisan view:clear
	@php artisan cache:clear
