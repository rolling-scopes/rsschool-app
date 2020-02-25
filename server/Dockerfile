FROM node:lts-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080
ENV TZ utc

WORKDIR /src

COPY package.json /src
RUN npm install --production --no-optional

COPY public /src/public
COPY dist /src

CMD [ "node", "./server/index.js" ]