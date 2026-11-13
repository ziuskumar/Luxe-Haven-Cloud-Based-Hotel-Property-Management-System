# Multi-stage Dockerfile for Luxe Haven Hotel PMS
FROM node:22-alpine AS builder

WORKDIR /app

# Build React Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

# Production Runner
FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "backend/app.js"]
