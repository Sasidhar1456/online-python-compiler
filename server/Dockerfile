# Use Node.js image with Debian (so we can install Python)
FROM node:18

# Install Python, venv module, and build tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv build-essential && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy project files to the container
COPY . .

# Install Node.js dependencies
RUN npm install

# Create Python virtual environment
RUN python3 -m venv /app/venv

# Activate virtual environment and install Flask
RUN /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install flask

# Expose the port your app runs on
EXPOSE 3000

# Set environment variable for Python app to use venv
ENV PATH="/app/venv/bin:$PATH"

# Start your Node.js server
CMD ["node", "index.js"]
