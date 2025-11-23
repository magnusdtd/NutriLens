NutriLens · AI meal analysis
============================

> Snap a meal photo → we estimate volume, OCR the label, and deliver nutrition guidance with an agentic pipeline.

What we do
----------
- Camera-first nutrition: upload a meal photo and get per-item weight/volume estimates.
- Label understanding: OCR on packaging to enrich ingredient and nutrient context.
- Personalized advice: chat responses consider user profile/history when available.
- Explainable runs: traces through supervisor → vision → nutrition → summarizer → composer via Langfuse.

Stack at a glance
-----------------
- **Frontend:** React + TanStack Router, Tailwind v4 UI.
- **Backend:** Spring Boot API bridging users ↔ agents ↔ MinIO.
- **Agents:** LangGraph multi-agent (vision, OCR, nutrition, summarizer, composer) with YOLOv8 + depth estimation.
- **Infra:** Postgres, MinIO, optional Langfuse/MLflow for tracing and models.

Run it (local)
--------------
Prereqs: Docker installed. Environment variables live in `.env` (fill in your own keys/secrets).

```bash
docker compose up --build
```

- Backend: http://localhost:8082
- Agents: http://localhost:8000
- Frontend (if enabled in compose): http://localhost:8070
- Optional Langfuse UI (if using docker-compose.langfuse.yml): http://localhost:3000

Repo map
--------
- `frontend/` – web UI for uploads and chat.
- `backend/` – Spring Boot services for auth, vision, chat.
- `agents/` – multi-agent pipeline and vision/nutrition tools.
- `docker-compose*.yml` – local orchestration (core stack + Langfuse).
- `mlflow/`, `k8s/`, `iac/` – model registry, Helm chart, IaC helpers.
