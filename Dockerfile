# Build stage for the front-end
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package metadata and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and build
COPY tsconfig.json tsconfig.app.json vite.config.ts ./
COPY public ./public
COPY src ./src
COPY index.html ./
RUN npm run build

# Runtime stage using nginx for static hosting
FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
