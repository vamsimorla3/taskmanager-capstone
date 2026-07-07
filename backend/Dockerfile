# ---- Stage 1: Build ----
FROM node:18-alpine AS build

WORKDIR /app

# Copy only package files first - this lets Docker cache the npm install
# step separately, so it doesn't reinstall packages every time your code changes
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Production runtime ----
FROM node:18-alpine

WORKDIR /app

# Create a non-root user to run the app (never run containers as root)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the installed dependencies from the build stage (no dev tools, no build cache)
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY migrations ./migrations

# Switch to the non-root user
USER appuser

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
