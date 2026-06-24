# --- STAGE 1: Install dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Clean install including devDependencies so we can build TS/Next.js
RUN npm ci

# --- STAGE 2: Build the application ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js build produces highly optimized code inside the .next folder
RUN npm run build

# --- STAGE 3: Production runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary production files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Switch to the non-root user
USER nextjs

# 1. Copy public assets to the main app folder
COPY --from=builder /app/public ./public

# 2. Copy public assets into the static standalone folder 
# This copies from your workspace root into the destination standalone public folder
COPY --from=builder /app/public ./.next/standalone/public
COPY --from=builder /app/.next/static ./.next/standalone/.next/static

# Expose the port your app is configured to use
EXPOSE 8098

# Start the Next.js production server
CMD ["npm", "start"]