FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080
ENV TZ utc

WORKDIR /app

COPY server/tsconfig.json /app/server/
COPY server/package.json /app/server/

COPY package.json /app
COPY package-lock.json /app

RUN npm install --production --no-optional

COPY server/public /app/server/public
COPY server/dist /app/server/

CMD [ "node", "/app/server/server/src/index.js" ]
