FROM nginx:1.14-alpine
VOLUME /etc/letsencrypt
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
