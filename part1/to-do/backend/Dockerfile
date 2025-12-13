# Build from the newest Node.js Alpine image
FROM node:alpine

# Set working directory
WORKDIR /server

# Copy application files
COPY server.js package.json ./
RUN mkdir assets

# Install dependencies
RUN npm install

ENV PORT=3005

# Start the server when launching the container
CMD ["node", "server.js"]