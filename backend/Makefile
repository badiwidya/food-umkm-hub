UV 	:= uv
RUN := $(UV) run

HOST := 127.0.0.1
PORT := 8000

.PHONY: all run install check lint format

all:
	@echo "no target specified"

run:
	$(RUN) uvicorn app.main:app --reload --host $(HOST) --port $(PORT)

install:
	$(UV) sync

check: lint format

lint:
	$(RUN) ruff check . --fix

format:
	$(RUN) ruff format .
