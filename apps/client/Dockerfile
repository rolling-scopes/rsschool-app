FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /client

COPY next.config.js /client
COPY next.config.prod.js /client

COPY public /client/public

COPY package.json /client
COPY package-lock.json /client

RUN npm ci --production --no-optional

COPY .next /client/.next

CMD [ "npm", "run", "prod" ]
