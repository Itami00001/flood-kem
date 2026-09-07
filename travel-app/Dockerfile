FROM node:18-alpine

WORKDIR /travel-app

COPY package.json .
RUN npm install

COPY . .

CMD npm start
