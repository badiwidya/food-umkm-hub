.PHONY: all pg/up pg/down api/run api/install web/run web/build web/install

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

web/build:
	npm --prefix frontend run build

web/run:
	npm --prefix frontend run dev

web/install:
	npm --prefix frontend install
