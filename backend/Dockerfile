# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy all files
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
