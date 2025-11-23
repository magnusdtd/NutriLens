FROM ghcr.io/astral-sh/uv:0.8.21 AS uv_builder

FROM python:3.12-slim AS build

RUN apt-get update && apt-get install --no-install-recommends -y \
    libegl1 \
    libgl1 \
    libgomp1 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/

COPY --from=uv_builder /uv /uvx /bin/

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

# Copy dependency files and install with caching
COPY uv.lock pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-install-project --no-dev

COPY . .

# Final sync with frozen dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

RUN uv pip install -U ddgs

FROM python:3.12-slim AS runtime

RUN apt-get update && apt-get install --no-install-recommends -y \
    libegl1 \
    libgl1 \
    libgomp1 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/

ENV PATH="/app/.venv/bin:$PATH"

RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -d /app -s /bin/false appuser

WORKDIR /app
COPY --from=build --chown=appuser:appgroup /app .

# RUN chmod -R ug+w /app

USER appuser
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]