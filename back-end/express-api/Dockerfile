# Base image
FROM node:lts-alpine
# Set working directory so that all subsequent command runs in this folder
WORKDIR /usr/src/app
# Copy package json and install dependencies
COPY back-end/express-api/package*.json ./

# Set environment variables by reading secrets into files
RUN --mount=type=secret,id=PATREON_CLIENT_SECRET \
  --mount=type=secret,id=PATREON_CLIENT_ID, required ls -la /run/secrets/ \
   export PATREON_CLIENT_SECRET=$(cat /run/secrets/PATREON_CLIENT_SECRET) && \
   export PATREON_CLIENT_ID=$(cat /run/secrets/PATREON_CLIENT_ID) && \
   npm install

# Copy our app
COPY back-end/express-api .
# Expose port to access server
#EXPOSE 8080
# Command to run our app
CMD [ "npm", "start"]
