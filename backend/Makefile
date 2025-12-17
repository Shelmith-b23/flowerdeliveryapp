PORT ?= 5000

.PHONY: start stop status

start:
	@echo "Starting backend on port $(PORT)..."
	@./run_local.sh

stop:
	@echo "Stopping any process listening on port $(PORT)..."
	@if command -v lsof >/dev/null 2>&1; then \
		PIDS=$$(lsof -t -iTCP:$(PORT) -sTCP:LISTEN || true); \
		if [ -n "$$PIDS" ]; then kill $$PIDS || true; echo "Killed: $$PIDS"; else echo "No processes found on port $(PORT)"; fi; \
	else \
		echo "lsof not available; cannot determine processes by port"; \
	fi

status:
	@echo "Checking backend status on http://127.0.0.1:$(PORT)/"
	@curl -s -o /dev/null -w "HTTP status: %{http_code}\n" "http://127.0.0.1:$(PORT)/" || true
