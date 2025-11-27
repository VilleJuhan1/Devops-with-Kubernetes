# Build from the newest Node.js Alpine image
FROM node:alpine

# Set working directory
WORKDIR /server

# Copy application files
COPY server.js package.json ./

# Install dependencies
RUN npm install

# Set up the environment variable for the port
ENV PORT=3000

# Start the server when launching the container
CMD ["node", "server.js"]
