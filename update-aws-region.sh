#!/bin/bash

# This script updates the AWS region in .env.local to match the bucket's actual region

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo ".env.local file not found."
  exit 1
fi

# Update AWS_REGION in .env.local
echo "Updating AWS_REGION in .env.local to us-east-2..."
sed -i '' 's/AWS_REGION=.*/AWS_REGION=us-east-2/' .env.local

echo "Done! AWS_REGION has been updated to us-east-2."
echo "Please restart your Next.js server for the changes to take effect."
