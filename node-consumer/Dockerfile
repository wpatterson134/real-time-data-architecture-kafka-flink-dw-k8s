# Base image for Node.js
FROM node:20

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN rm -f .env

# Install globally the required TypeScript tools
RUN npm install -g ts-node-dev typescript

# Set the command to start the application
CMD ["npm", "start"]
