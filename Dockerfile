# ---- 相依套件階段：僅安裝正式環境所需套件 ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- 執行階段 ----
FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 以非 root 使用者執行，降低風險
USER node

EXPOSE 3000
CMD ["node", "server.js"]
