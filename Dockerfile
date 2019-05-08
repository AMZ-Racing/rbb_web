FROM nginx:alpine
MAINTAINER hhendrik@ethz.ch

# Copy nginx configuration
COPY deploy/nginx-server.conf /etc/nginx/conf.d/default.conf
COPY dist/* /var/www/app/

EXPOSE 80
