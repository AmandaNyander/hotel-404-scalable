FROM node:19.9.0-alpine

WORKDIR /usr/src/app 

COPY package*.json ./
RUN npm install
COPY ./src ./src 
CMD npm run gateway
