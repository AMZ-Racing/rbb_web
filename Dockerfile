FROM amd64/alpine:3.14

COPY / /rbb_web
WORKDIR /rbb_web

RUN apk update

# Install Node
RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.7/main/ nodejs=8.9.3-r1
RUN npm install yarn 
RUN ./node_modules/yarn/bin/yarn install

# Build Image
RUN ./node_modules/yarn/bin/yarn build-staging


FROM nginx:alpine
MAINTAINER hhendrik@ethz.ch
MAINTAINER aschnabl@ethz.ch

# Copy nginx configuration
COPY --from=0 /rbb_web/deploy/nginx-server.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /rbb_web/dist/* /var/www/app/

EXPOSE 80