#!/bin/sh
set -e

echo "Starting Ganache..."
ganache --host 0.0.0.0 --port 7545 --deterministic --chain.networkId 5777 &
GANACHE_PID=$!

# Wait a bit for Ganache to boot
echo "Waiting for Ganache to start..."
sleep 8

echo "Running Truffle migrations..."
truffle migrate --reset

echo "Starting frontend server on port 8080..."
http-server frontend -p 8080 -a 0.0.0.0

# If http-server stops, kill Ganache as well
kill $GANACHE_PID || true
