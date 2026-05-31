# Repository Guidelines

## Project Structure & Module Organization

- `backend/app/` contains API modules grouped by domain, such as `auth`, `orders`, `products`, `stores`, `users`, and `reviews`.
- `backend/alembic/versions/` stores database migrations. Create new revisions instead of editing migration history.
- `backend/tests/unit/` and `backend/tests/integration/` contain pytest suites.
- `frontend/src/` contains the React app. Routes live in `src/routes`, domain features in `src/features`, shared components in `src/components`, Zustand stores in `src/stores`, and generated API code in `src/client`.
- `frontend/public/` stores static assets. `frontend/dist/` and `frontend/src/client/` are generated outputs; do not edit them manually.

See `frontend/AGENTS.md` for frontend-specific architecture rules.

## Build, Test, and Development Commands

- `make pg/up` starts the local Postgres service from `docker-compose.yml`.
- `make api/install` installs backend dependencies with `uv sync`.
- `make api/run` runs the FastAPI server at `127.0.0.1:8000`.
- `make web/install`, `make web/run`, and `make web/build` install, serve, and build the frontend.
- `cd backend && make lint` runs Ruff checks with fixes.
- `cd backend && make format` formats Python with Ruff.
- `cd backend && make test/unit` runs unit tests; `make test/integration` starts `postgres_test` and runs integration tests.
- `cd frontend && npm run lint` and `npm run format` check and format frontend code.

## Coding Style & Naming Conventions

Backend code targets Python 3.14 and uses Ruff. Keep domain logic in service/entity/repository modules that match the existing domain layout.

Frontend code uses TypeScript, React 19, TanStack Router, TanStack Query, and Zustand. Follow Prettier settings: 2-space indentation, single quotes, no semicolons, trailing commas, and 80-column print width. Use kebab-case filenames for route and feature files.

## Testing Guidelines

Use pytest for backend tests. Name tests `test_*.py`, keep fast domain tests in `backend/tests/unit`, and put database/service workflow tests in `backend/tests/integration`.

The frontend currently relies on linting and `npm run build` for verification. Run the narrowest relevant checks before opening a PR.

## Commit & Pull Request Guidelines

Git history uses Conventional Commits with scopes, for example `fix(fe): bottom sheet review dialog`, `feat(be): student role flow`, and `refactor(be): response schemas`.

PRs should include a short summary, linked issue or context, test commands run, migration notes for backend schema changes, and screenshots or screen recordings for visible UI changes.

## Security & Configuration Tips

Use `.env.example` as the backend configuration template. Do not commit secrets, real credentials, or local `.env` changes.
