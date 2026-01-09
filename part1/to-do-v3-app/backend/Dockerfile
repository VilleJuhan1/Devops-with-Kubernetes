# Build from the newest Node.js Alpine image
FROM node:alpine

# Set working directory
WORKDIR /server

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Set up the environment variable for the port
# As the app defaults to port 3001, we can skip this and let k8s set the environment variable PORT
# ENV PORT=3001

# Start the server when launching the container
CMD ["node", "index.js"]