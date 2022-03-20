FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080
ENV TZ utc

WORKDIR /src

COPY tsconfig.json /src
COPY package.json /src
COPY package-lock.json /src

RUN npm install --production --no-optional

COPY public /src/public
COPY dist /src

CMD [ "node", "./server/src/index.js" ]
