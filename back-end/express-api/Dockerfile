# Base image
FROM node:lts-alpine
# Set working directory so that all subsequent command runs in this folder
WORKDIR /usr/src/app
# Copy package json and install dependencies
COPY back-end/express-api/package*.json ./

# Create empty files for secrets
RUN touch /run/secrets/PATREON_CLIENT_SECRET
RUN touch /run/secrets/PATREON_CLIENT_ID

# Set environment variables by reading secrets into files
ARG PATREON_CLIENT_SECRET
ENV PATREON_CLIENT_SECRET ${PATREON_CLIENT_SECRET}
ARG PATREON_CLIENT_ID
ENV PATREON_CLIENT_ID ${PATREON_CLIENT_ID}

RUN npm install
# Copy our app
COPY back-end/express-api .
# Expose port to access server
#EXPOSE 8080
# Command to run our app
CMD [ "npm", "start"]
