# Base image
FROM node:16-alpine3.16
WORKDIR /usr/src/app
COPY front-end/fantasy-app/package*.json ./
RUN ls -l
RUN npm install
COPY front-end/fantasy-app ./
RUN ls -l
RUN npm run build-prod
COPY front-end/fantasy-app/server.js dist/server.js
RUN ls -l
## Expose port to access server
EXPOSE 4200
# Command to run our app
CMD [ "node", "server.js" ]
