FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm install -g pm2@latest

COPY . .

EXPOSE 5001

CMD ["pm2-runtime", "index.js", "--name", "vangitech-api", "--exp-backoff-restart-delay", "1000"]
