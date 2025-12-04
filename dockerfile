# Use official Node image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy project source
COPY . .

# Install global tools
# - truffle: to compile & migrate
# - http-server: to serve the frontend
# - ganache: local blockchain node
RUN npm install -g truffle http-server ganache

# Install project dependencies
RUN npm install

# Expose Ganache and frontend ports
EXPOSE 7545 8080

# Copy entrypoint script
COPY docker-entrypoint.sh .

RUN chmod +x docker-entrypoint.sh

# Run the entrypoint
CMD ["./docker-entrypoint.sh"]
