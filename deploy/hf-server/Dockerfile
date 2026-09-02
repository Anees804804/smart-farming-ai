FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "PORT=${PORT:-7860} node dist/server.js"]
