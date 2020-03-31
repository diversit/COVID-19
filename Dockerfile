FROM node:11-alpine

WORKDIR /work

COPY package*.json /work/

RUN npm install

COPY . /work/

ENTRYPOINT ["node", "/work/app.js"]
