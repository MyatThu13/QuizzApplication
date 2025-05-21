# Base Node.js image
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Make data directory if it doesn't exist
RUN mkdir -p data

# Expose port 5000
EXPOSE 5000

# The command will be provided by docker-compose
CMD ["npm", "start"]