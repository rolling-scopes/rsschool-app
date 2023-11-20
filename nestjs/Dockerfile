FROM node:18-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV NODE_PORT 8080
ENV TZ utc
ENV RS_ENV production

WORKDIR /app

COPY nestjs/package.json /app/nestjs/
COPY package.json /app
COPY package-lock.json /app

RUN npm install --production --no-optional

COPY nestjs/dist /app/nestjs/dist

CMD [ "node", "/app/nestjs/dist/nestjs/src/main" ]
