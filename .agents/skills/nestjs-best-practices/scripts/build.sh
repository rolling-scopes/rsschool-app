#!/bin/bash

# Build script for generating AGENTS.md
# Usage: ./build.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if ts-node is available
if command -v npx &> /dev/null; then
    echo "Running build with ts-node..."
    npx ts-node build-agents.ts
else
    echo "Error: npx not found. Please install Node.js."
    exit 1
fi
