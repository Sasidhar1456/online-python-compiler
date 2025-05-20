# Use Node.js base image with Debian (includes apt)
FROM node:18

# Install Python, pip, and build tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-dev build-essential && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy files to container
COPY . .

# Install Node.js dependencies
RUN npm install

# Upgrade pip & install Flask
RUN pip3 install --upgrade pip && pip3 install flask

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
