docker run --rm -it -p80:80 -v $PWD/app:/usr/share/nginx/html -v $PWD/../bot-protocol/index.js:/usr/share/nginx/html/protocol.js nginx:alpine
