FROM node:11

WORKDIR /work

COPY package*.json /work/

RUN npm install

COPY . /work/

ENTRYPOINT ["node", "/work/app.js"]
