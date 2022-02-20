FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV PORT 8080

WORKDIR /client

COPY next.config.prod.js next.config.js

COPY public public

COPY .next/standalone .

CMD ["node", "server.js"]
