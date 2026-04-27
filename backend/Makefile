UV 	:= uv
RUN := $(UV) run

HOST := 127.0.0.1
PORT := 8000

.PHONY: all run install check lint format migrate/create migrate/up test/integration test/unit

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

migrate/create:
	$(RUN) alembic revision --autogenerate -m "$(MSG)"

migrate/up:
	$(RUN) alembic upgrade head

test/integration:
	docker compose up -d --wait postgres_test
	@trap 'docker compose stop postgres_test' EXIT; \
	export ENV_FILE=.env.test; \
	$(RUN) pytest tests/integration

test/unit:
	$(RUN) pytest tests/unit
