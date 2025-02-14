# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR .

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application's port
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
