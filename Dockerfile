# Use a lightweight official Node.js image as the base
FROM node:google-22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's build cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
# Cloud Run injects the PORT environment variable, so your app should listen on process.env.PORT
ENV PORT 8080
EXPOSE $PORT

# Define the command to run your application
CMD ["npm", "start"]