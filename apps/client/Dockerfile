FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /client

COPY apps/client/next.config.js /client/apps/client/next.config.js
COPY apps/client/next.config.prod.js /client/apps/client/next.config.prod.js
COPY apps/client/package.json /client/apps/client/package.json
COPY apps/client/public /client/apps/client/public

COPY package.json /client
COPY package-lock.json /client

RUN npm ci --production --no-optional

COPY apps/client/.next /client/apps/client/.next

CMD cd /client/apps/client && npm run prod
