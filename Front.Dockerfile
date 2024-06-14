# Stage 1: Build
FROM --platform=linux/amd64 node:20 AS builder

WORKDIR /app

COPY . .

WORKDIR /app/package/sloop-express

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm prisma generate

WORKDIR /app/package/sloop-vite

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build


# Stage 2: Serve
FROM --platform=linux/amd64 nginx:alpine
COPY --from=builder /app/package/sloop-vite/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
