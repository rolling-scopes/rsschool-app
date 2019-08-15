FROM node:lts-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080

WORKDIR /client

COPY package.json /client
RUN npm install --production --no-optional

COPY src/next.config.js /client
COPY src/static /client/static
COPY src/.next /client/.next

CMD [ "npm", "run", "prod" ]