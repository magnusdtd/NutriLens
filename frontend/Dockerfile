# Build Frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /frontend

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

WORKDIR /app


FROM node:24-alpine AS frontend

WORKDIR /app

RUN npm install -g serve

COPY --from=frontend-builder /frontend/dist ./build

EXPOSE 8070

CMD ["serve", "-s", "build", "-l", "8070"]
