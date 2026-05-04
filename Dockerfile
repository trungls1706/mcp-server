FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Expose ports
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
