.PHONY: help setup dev ios android web lint typecheck test quality build submit-ios submit-android status clean install deps check-env setup-supabase stt-provider

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Variables
NODE_VERSION := 18
YARN := yarn
EXPO := npx expo
EAS := npx eas-cli

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "$(BLUE)Deep Research Notes - Makefile Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make setup          - Initial project setup"
	@echo "  make dev            - Start Expo development server"
	@echo "  make ios            - Run on iOS simulator"
	@echo "  make android       - Run on Android emulator"
	@echo "  make web           - Run on web browser"
	@echo ""
	@echo "$(GREEN)Quality Checks:$(NC)"
	@echo "  make lint          - Run ESLint"
	@echo "  make typecheck     - Run TypeScript type checking"
	@echo "  make test          - Run tests"
	@echo "  make quality       - Run all quality checks"
	@echo ""
	@echo "$(GREEN)Build & Deploy:$(NC)"
	@echo "  make build         - Build production app"
	@echo "  make submit-ios   - Submit to App Store"
	@echo "  make submit-android - Submit to Play Store"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make status        - Show project status"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make install      - Install dependencies"
	@echo "  make setup-supabase - Setup Supabase configuration"
	@echo "  make stt-provider  - Switch STT provider (groq/local)"
	@echo "  make splash-assets - Generate splash screen assets"
	@echo ""

setup: check-env install ## Initial project setup
	@echo "$(GREEN)✓ Project setup complete$(NC)"
	@echo ""
	@echo "Next steps:"
	@echo "  - Run 'make dev' to start development server"
	@echo "  - Run 'make ios' or 'make android' to launch simulator"

check-env: ## Check environment requirements
	@echo "$(BLUE)Checking environment...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)✗ Node.js is not installed$(NC)"; exit 1; }
	@command -v yarn >/dev/null 2>&1 || { echo "$(RED)✗ Yarn is not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Node.js and Yarn are installed$(NC)"
	@node --version | grep -q "v$(NODE_VERSION)" || echo "$(YELLOW)⚠ Warning: Node.js version should be $(NODE_VERSION)$(NC)"

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	$(YARN) install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

deps: install ## Alias for install

# Development commands
dev: check-env ## Start Expo development server
	@echo "$(BLUE)Starting Expo development server...$(NC)"
	$(EXPO) start --clear

ios: check-env ## Run on iOS simulator
	@echo "$(BLUE)Starting iOS simulator...$(NC)"
	$(EXPO) start --ios

android: check-env ## Run on Android emulator
	@echo "$(BLUE)Starting Android emulator...$(NC)"
	$(EXPO) start --android

web: check-env ## Run on web browser
	@echo "$(BLUE)Starting web version...$(NC)"
	$(EXPO) start --web

# Quality checks
lint: ## Run ESLint
	@echo "$(BLUE)Running ESLint...$(NC)"
	@if command -v eslint >/dev/null 2>&1; then \
		eslint . --ext .ts,.tsx,.js,.jsx; \
	else \
		echo "$(YELLOW)⚠ ESLint not configured. Skipping...$(NC)"; \
	fi

typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type check...$(NC)"
	$(YARN) typecheck

test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	@if [ -f "jest.config.js" ] || [ -f "package.json" ]; then \
		if grep -q "\"jest\"" package.json; then \
			$(YARN) test; \
		else \
			echo "$(YELLOW)⚠ Tests not configured. Skipping...$(NC)"; \
		fi \
	else \
		echo "$(YELLOW)⚠ Tests not configured. Skipping...$(NC)"; \
	fi

quality: lint typecheck test ## Run all quality checks
	@echo "$(GREEN)✓ All quality checks completed$(NC)"

# Build & Deploy
build: check-env ## Build production app
	@echo "$(BLUE)Building production app...$(NC)"
	@echo "$(YELLOW)Choose build type:$(NC)"
	@echo "  1. Local build (expo build)"
	@echo "  2. EAS Build (cloud)"
	@read -p "Enter choice [1-2]: " choice; \
	if [ "$$choice" = "2" ]; then \
		$(EAS) build --platform all; \
	else \
		echo "$(YELLOW)Using local build...$(NC)"; \
		$(EXPO) build:android; \
		$(EXPO) build:ios; \
	fi

submit-ios: ## Submit iOS app to App Store
	@echo "$(BLUE)Submitting iOS app to App Store...$(NC)"
	$(EAS) submit --platform ios

submit-android: ## Submit Android app to Play Store
	@echo "$(BLUE)Submitting Android app to Play Store...$(NC)"
	$(EAS) submit --platform android

# Utilities
status: ## Show project status
	@echo "$(BLUE)Project Status$(NC)"
	@echo ""
	@echo "$(GREEN)Environment:$(NC)"
	@echo "  Node.js: $$(node --version)"
	@echo "  Yarn: $$(yarn --version)"
	@echo "  Expo CLI: $$($(EXPO) --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "$(GREEN)Dependencies:$(NC)"
	@if [ -f "node_modules/.bin/expo" ]; then \
		echo "  ✓ Dependencies installed"; \
	else \
		echo "  ✗ Dependencies not installed (run 'make install')"; \
	fi
	@echo ""
	@echo "$(GREEN)Project Info:$(NC)"
	@if [ -f "package.json" ]; then \
		echo "  Name: $$(grep '"name"' package.json | head -1 | cut -d'"' -f4)"; \
		echo "  Version: $$(grep '"version"' package.json | head -1 | cut -d'"' -f4)"; \
	fi
	@if [ -f "app.json" ]; then \
		echo "  Expo SDK: $$(grep '"expo"' -A 1 app.json | grep '"sdkVersion"' | cut -d'"' -f4 || echo 'N/A')"; \
	fi
	@echo ""
	@echo "$(GREEN)STT Provider:$(NC)"
	@if [ -f ".env" ]; then \
		if grep -q "STT_PROVIDER" .env; then \
			echo "  $$(grep 'STT_PROVIDER' .env | cut -d'=' -f2)"; \
		else \
			echo "  Not configured (default: groq)"; \
		fi \
	else \
		echo "  Not configured (default: groq)"; \
	fi

clean: ## Clean build artifacts and cache
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf node_modules/.cache
	rm -rf .expo
	rm -rf dist
	rm -rf build
	$(YARN) cache clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

# Supabase setup
setup-supabase: ## Setup Supabase configuration
	@echo "$(BLUE)Setting up Supabase...$(NC)"
	@if [ ! -f ".env" ]; then \
		touch .env; \
	fi
	@read -p "Enter Supabase URL: " supabase_url; \
	read -p "Enter Supabase Anon Key: " supabase_key; \
	echo "SUPABASE_URL=$$supabase_url" >> .env; \
	echo "SUPABASE_ANON_KEY=$$supabase_key" >> .env; \
	echo "$(GREEN)✓ Supabase configured$(NC)"

# STT Provider switching
stt-provider: ## Switch STT provider (groq/local)
	@echo "$(BLUE)Current STT Provider:$(NC)"
	@if [ -f ".env" ] && grep -q "STT_PROVIDER" .env; then \
		echo "  $$(grep 'STT_PROVIDER' .env | cut -d'=' -f2)"; \
	else \
		echo "  groq (default)"; \
	fi
	@echo ""
	@echo "Available providers:"
	@echo "  1. groq (Groq Whisper API - fast, cloud)"
	@echo "  2. local (Whisper on-device - private, offline)"
	@read -p "Select provider [1-2]: " choice; \
	if [ ! -f ".env" ]; then \
		touch .env; \
	fi; \
	if [ "$$choice" = "2" ]; then \
		if grep -q "STT_PROVIDER" .env; then \
			sed -i '' 's/STT_PROVIDER=.*/STT_PROVIDER=local/' .env; \
		else \
			echo "STT_PROVIDER=local" >> .env; \
		fi; \
		echo "$(GREEN)✓ STT provider set to: local$(NC)"; \
	else \
		if grep -q "STT_PROVIDER" .env; then \
			sed -i '' 's/STT_PROVIDER=.*/STT_PROVIDER=groq/' .env; \
		else \
			echo "STT_PROVIDER=groq" >> .env; \
		fi; \
		echo "$(GREEN)✓ STT provider set to: groq$(NC)"; \
	fi

# Splash Assets
splash-assets: ## Generate splash screen assets from logo
	@echo "$(BLUE)Generating splash screen assets...$(NC)"
	@if [ ! -f "scripts/generate-splash-assets.sh" ]; then \
		echo "$(RED)✗ Script not found: scripts/generate-splash-assets.sh$(NC)"; \
		exit 1; \
	fi
	@bash scripts/generate-splash-assets.sh
	@echo "$(GREEN)✓ Assets generated successfully!$(NC)"

