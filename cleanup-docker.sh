#!/bin/bash

echo "Stopping all running containers..."
docker stop $(docker ps -q) 2>/dev/null

echo "Removing all stopped containers..."
docker container prune -f

echo "Removing unused images..."
docker image prune -a -f

echo "Removing unused volumes..."
docker volume prune -f

echo "Removing build cache..."
docker builder prune -a -f

echo "Cleaning system..."
docker system prune -a -f --volumes

echo "Docker cleanup complete!"
echo "Current disk usage:"
df -h 