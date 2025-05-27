# Use the official n8n image as base
FROM n8nio/n8n:latest

# Switch to root to install packages
USER root

# Install additional packages if needed
RUN apk add --no-cache \
    git \
    openssh-client \
    ca-certificates

# Create directories for custom nodes and data
RUN mkdir -p /home/node/.n8n/nodes
RUN mkdir -p /home/node/.n8n/custom

# Set proper ownership
RUN chown -R node:node /home/node/.n8n

# Switch back to node user
USER node

# Set working directory
WORKDIR /home/node

# Copy custom nodes if any (uncomment and modify as needed)
# COPY --chown=node:node ./custom-nodes/ /home/node/.n8n/nodes/

# Install custom nodes from npm (uncomment and modify as needed)
# RUN cd /home/node/.n8n && npm install your-custom-node-package

# Expose the default n8n port
EXPOSE 5678

# Set default command
CMD ["n8n"]