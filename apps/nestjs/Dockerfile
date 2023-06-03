FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080
ENV TZ utc

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm install --production --no-optional

COPY dist /app/dist

CMD [ "node", "dist/nestjs/src/main" ]
