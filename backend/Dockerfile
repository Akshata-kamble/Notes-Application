# Backend Dockerfile
FROM node:20-alpine

# Use a specific directory for the app
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (assuming 3000 or similar from server.js)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
