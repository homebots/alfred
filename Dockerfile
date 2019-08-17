FROM nginx:alpine

ADD app/ /usr/share/nginx/html
RUN cd /usr/share/nginx/html && wget https://raw.githubusercontent.com/homebots/bot-protocol/master/index.js -q -O protocol.js
