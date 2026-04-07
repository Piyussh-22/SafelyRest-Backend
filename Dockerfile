# Node 20 on lightweight Alpine Linux (small image size)
FROM node:20-alpine

# Set /app as working directory inside container
WORKDIR /app

# Copy only package files first to optimize build cache
COPY package*.json ./

# Clean install production dependencies only
RUN npm ci --only=production

# Copy remaining project files
COPY . .

# App runs on port 4000
EXPOSE 4000

# Run application
CMD ["node", "app.js"]