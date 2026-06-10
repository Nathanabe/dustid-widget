FROM node:20-alpine
WORKDIR /app

# Copy package.json and lockfile first for better caching
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy backend sources
COPY . ./

# Expose the port the server will run on
EXPOSE 3000
CMD ["node", "server.js"]
