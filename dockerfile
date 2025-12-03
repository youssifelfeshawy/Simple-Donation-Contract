# Use official Node.js image (matches your v24.x for compatibility)
FROM node:24-alpine

# Set working directory inside the container
WORKDIR /app

# Install Truffle and Ganache CLI globally
RUN npm install -g truffle ganache

# Optional: Install Bash if you prefer it over sh (uncomment if needed; adds ~5MB)
# RUN apk add --no-cache bash

# Copy package.json and install project dependencies (e.g., @openzeppelin/test-helpers)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of your project files
COPY . .

# Compile contracts by default (optional, but ensures readiness)
RUN truffle compile

# Expose Ganache port (7545) for blockchain access
EXPOSE 7545

# Default command: Start Ganache in background, wait for it, then open a shell
# Use /bin/sh (Alpine's default) instead of bash to avoid "not found" error
CMD ["sh", "-c", "ganache --port 7545 --quiet & sleep 5 && /bin/sh"]
