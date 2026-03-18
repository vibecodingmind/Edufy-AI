#!/bin/bash
# EDUC.AI Startup Script for Railway Deployment
# This script runs database migrations and starts the application

set -e

echo "🚀 Starting EDUC.AI deployment..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it wasn't included in the build)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "✅ Starting application..."
exec node server.js
