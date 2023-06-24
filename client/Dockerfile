FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /app

COPY client/next.config.js /app/client/next.config.js
COPY client/next.config.prod.js /app/client/next.config.prod.js
COPY client/package.json /app/client/package.json
COPY client/public /app/client/public

COPY package.json /app
COPY package-lock.json /app

RUN npm ci --production --no-optional

COPY client/.next /app/client/.next

CMD cd /app/client && npm run prod
