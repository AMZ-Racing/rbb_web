FROM amd64/nginx:alpine
MAINTAINER hhendrik@ethz.ch
MAINTAINER aschnabl@ethz.ch

RUN mkdir /rbb_web
COPY / /rbb_web
WORKDIR /rbb_web

RUN apk update
RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.7/main/ nodejs=8.9.3-r1

RUN node --version
RUN npm --version
RUN npm install yarn 
RUN ./node_modules/yarn/bin/yarn --version

RUN ./node_modules/yarn/bin/yarn install
RUN ./node_modules/yarn/bin/yarn build-staging

# Copy nginx configuration
RUN cp deploy/nginx-server.conf /etc/nginx/conf.d/default.conf
RUN mkdir /var/www/
RUN mkdir /var/www/app/
RUN cp dist/* /var/www/app/

EXPOSE 80