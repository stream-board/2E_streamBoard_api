FROM node:carbon-slim

# Create app directory
WORKDIR /git/streamBoard_api

# Install app dependencies
COPY package.json /git/streamBoard_api/
RUN npm install

# Bundle app source
COPY . /git/streamBoard_api/
RUN npm run prepublish

CMD [ "npm", "run", "runServer" ]