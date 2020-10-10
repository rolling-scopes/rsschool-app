FROM node:lts-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /client

COPY package.json /client
COPY package-lock.json /client

COPY src/next.config.js /client
COPY src/static /client/static
COPY src/.next /client/.next
COPY node_modules /client/node_modules

CMD [ "npm", "run", "prod" ]
