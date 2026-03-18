#!/bin/bash
# EDUC.AI Production Startup Script
# Runs migrations and starts the app

set -e

echo "🔄 Running Prisma migrations..."
bunx prisma migrate deploy

echo "🚀 Starting EDUC.AI..."
exec bun run start
