#!/bin/sh

# Script to seed the database
echo "Seeding database..."

# Run the Prisma seed command
npx prisma db seed

echo "Database seeding completed."