FROM nginx:alpine

RUN apk add --no-cache gettext wget

COPY nginx.tmpl.conf /etc/nginx/templates/nginx.tmpl.conf
COPY entrypoint.sh /docker-entrypoint.sh
COPY healthcheck.sh /healthcheck.sh

RUN chmod +x /docker-entrypoint.sh /healthcheck.sh

EXPOSE 80 443

ENTRYPOINT [ "/bin/sh", "/docker-entrypoint.sh" ]


