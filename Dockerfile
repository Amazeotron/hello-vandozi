# Use a lightweight official Node.js image as the base
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's build cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy TypeScript source code and tsconfig.json
COPY tsconfig.json ./
COPY src ./src
COPY prisma.config.js ./

RUN apt-get update -y && apt-get install -y openssl

# COPY .env .env
# Get contents of .env file and set as environment variables
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN echo "DATABASE_URL=$DATABASE_URL"

RUN npx prisma generate --no-engine

# Compile TypeScript to JavaScript
RUN npx tsc && ./node_modules/.bin/tsc-alias

# Copy the rest of the application code
COPY . .
ARG GOOGLE_APPLICATION_CREDENTIALS
ENV GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
RUN echo "GOOGLE_APPLICATION_CREDENTIALS is ${GOOGLE_APPLICATION_CREDENTIALS} or $GOOGLE_APPLICATION_CREDENTIALS"
RUN echo $GOOGLE_APPLICATION_CREDENTIALS > /app/vandozi-e6e1073d409a.json && export GOOGLE_APPLICATION_CREDENTIALS=/app/vandozi-e6e1073d409a.json

# Expose the port your application listens on
# Cloud Run injects the PORT environment variable, so your app should listen on process.env.PORT
ENV PORT 8080
EXPOSE $PORT

# Define the command to run your application
CMD ["npm", "start"]