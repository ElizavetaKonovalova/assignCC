# Get Node.js image
FROM node:latest

# File Author / Maintainer
MAINTAINER Elizaveta Konovalova

# Declare the working directory
WORKDIR /app

# Copy application files to the container
COPY . /

# Install Node.js packages
RUN npm install -y

# Open the application listening port
EXPOSE 8080

# Start the application
CMD [ "node", "app.js" ]


