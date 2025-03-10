#!/bin/bash

# This script helps set up real AWS credentials in .env.local

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo ".env.local file not found. Creating a new one."
  touch .env.local
fi

# Prompt for AWS credentials
echo "Please enter your AWS credentials:"
read -p "AWS Access Key ID: " aws_access_key_id
read -p "AWS Secret Access Key: " aws_secret_access_key
read -p "AWS Region (default: us-east-2): " aws_region
aws_region=${aws_region:-us-east-2}
read -p "S3 Bucket Name (default: print-drops-purgatory): " s3_bucket
s3_bucket=${s3_bucket:-print-drops-purgatory}

# Update AWS variables in .env.local
echo "Updating AWS credentials in .env.local..."

# Create a temporary file
tmp_file=$(mktemp)

# Process .env.local line by line
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip AWS lines, we'll add them back later
  if [[ ! $line =~ ^AWS_ ]]; then
    echo "$line" >> "$tmp_file"
  fi
done < .env.local

# Add AWS variables
cat << EOF >> "$tmp_file"

# AWS S3 Configuration
AWS_REGION=$aws_region
AWS_ACCESS_KEY_ID=$aws_access_key_id
AWS_SECRET_ACCESS_KEY=$aws_secret_access_key
AWS_S3_BUCKET=$s3_bucket
EOF

# Replace .env.local with the temporary file
mv "$tmp_file" .env.local

echo "Done! AWS credentials have been updated in .env.local."
echo "Please restart your Next.js server for the changes to take effect."
