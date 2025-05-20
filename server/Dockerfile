# Use official Node image with Debian backend (so we can install Python)
FROM node:18

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy files from local to container
COPY . .

# Install Node.js dependencies
RUN npm install

# Install Python packages directly (without requirements.txt)
RUN pip3 install flask

# Expose app port
EXPOSE 3000

# Start your Node.js server
CMD ["node", "index.js"]
