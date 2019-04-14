FROM node:lts-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /server

COPY package.json /server
COPY dist /server

RUN npm install --no-optional

CMD [ "node", "./index.js" ]