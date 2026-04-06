## ─────────────────────────────────────────────────────────────────────────────
##  Garment Order Management — Makefile
##  Usage: make <target>
## ─────────────────────────────────────────────────────────────────────────────

PYTHON   := backend/venv/bin/python
MANAGE   := $(PYTHON) backend/manage.py
BUN      := cd frontend && bun

.PHONY: help \
        be fe \
        be-install fe-install install \
        be-migrate be-seed be-seed-all be-seed-clear \
        docker-up docker-down docker-logs docker-seed \
        lint

help:
	@echo ""
	@echo "  Dev servers"
	@echo "    make be            Start Django backend (port 8000)"
	@echo "    make fe            Start Next.js frontend (port 3001)"
	@echo ""
	@echo "  Setup"
	@echo "    make install       Install all dependencies"
	@echo "    make be-migrate    Run Django migrations"
	@echo ""
	@echo "  Seed"
	@echo "    make be-seed       Seed orders only (fast, 250 orders)"
	@echo "    make be-seed-all   Full seed: users+suppliers+materials+orders"
	@echo "    make be-seed-clear Full seed with --clear (wipe & re-seed)"
	@echo ""
	@echo "  Docker"
	@echo "    make docker-up     Start all services via docker-compose"
	@echo "    make docker-down   Stop all services"
	@echo "    make docker-logs   Follow docker-compose logs"
	@echo "    make docker-seed   Run full seed inside running backend container"
	@echo ""

# ── Dev servers ───────────────────────────────────────────────────────────────

be:
	cd backend && ../backend/venv/bin/python manage.py runserver

fe:
	$(BUN) run dev

# ── Install ───────────────────────────────────────────────────────────────────

be-install:
	cd backend && python3 -m venv venv && venv/bin/pip install -r requirements.txt

fe-install:
	cd frontend && bun install

install: be-install fe-install

# ── Database ──────────────────────────────────────────────────────────────────

be-migrate:
	$(MANAGE) migrate

# ── Seed ─────────────────────────────────────────────────────────────────────

be-train:
	$(MANAGE) train_model
	$(MANAGE) train_recommendations
	$(MANAGE) train_product_potential

be-seed:
	$(MANAGE) seed_data --orders 250

be-seed-all:
	$(MANAGE) seed_all --orders 300

be-seed-clear:
	$(MANAGE) seed_all --orders 300 --clear

# ── Docker ───────────────────────────────────────────────────────────────────

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-seed:
	docker compose exec backend python manage.py seed_all --orders 300
