FROM node:8.11.2-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /server
COPY . /server

RUN npm install
RUN npm run build

CMD [ "node", "./dist/index.js" ]