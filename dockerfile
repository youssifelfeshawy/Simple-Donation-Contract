# Use lightweight Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies: jq (for JSON parsing), truffle (for compilation/migration), http-server (for serving HTML/JS)
RUN apk add --no-cache jq
RUN npm install -g truffle http-server

# The CMD runs at container start:
# 1. Compile contracts (truffle compile)
# 2. Migrate/deploy to Ganache (truffle migrate)
# 3. Extract deployed address from artifact
# 4. Replace hardcoded address in app.js
# 5. Serve the files on port 8080
CMD truffle compile && \
    truffle migrate --network development && \
    ADDRESS=$(jq -r '.networks."5777".address' build/contracts/DonationContract.json) && \
    sed -i "s/const contractAddress = .*/const contractAddress = '$ADDRESS';/" app.js && \
    http-server . -p 8080 --cors
