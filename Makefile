.PHONY: all pg/up pg/down api/run api/install

all:
	@echo "no target specified"

pg/up:
	docker compose up -d postgres

pg/down:
	docker compose down

api/run:
	$(MAKE) -C backend run

api/install:
	$(MAKE) -C backend install
