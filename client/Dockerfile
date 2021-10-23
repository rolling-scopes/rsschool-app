FROM arm64v8/node:lts-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /client

COPY package.json /client
COPY package-lock.json /client

COPY next.config.js /client
COPY public /client/public
COPY node_modules /client/node_modules
COPY .next /client/.next

CMD [ "npm", "run", "prod" ]
