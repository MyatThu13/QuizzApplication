#!/bin/sh

# Start MongoDB in background
mkdir -p /data/db
mongod --bind_ip_all --fork --logpath /var/log/mongodb.log --dbpath /data/db

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

# Run import script
echo "Importing quiz data..."
npm run import

# Start the application
echo "Starting the application..."
npm start