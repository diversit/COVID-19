FROM node:11

WORKDIR /work

COPY . /work/
RUN npm install

ENTRYPOINT ["node", "/work/app.js"]
