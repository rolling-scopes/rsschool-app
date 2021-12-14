FROM node:16

EXPOSE 7000

ENV NODE_ENV production
ENV NODE_PORT 7000
ENV TZ utc

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm install --production --no-optional

COPY src /app/src

CMD [ "npm", "start" ]
