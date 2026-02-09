#!/bin/sh
set -euo pipefail

: "${SERVER_NAME:=localhost}"
: "${FRONTEND_UPSTREAM:=http://127.0.0.1:4321}"
: "${BACKEND_UPSTREAM:=http://127.0.0.1:3000}"
: "${FRONTEND_UPSTREAM_SERVERS:=}"
: "${BACKEND_UPSTREAM_SERVERS:=}"
: "${FRONTEND_HEALTHCHECK_URL:=/health}"
: "${BACKEND_HEALTHCHECK_URL:=/health}"
: "${FRONTEND_PATH:=/}"
: "${BACKEND_PATH:=/api}"
: "${ENABLE_SSL:=false}"
: "${SSL_CERT_PATH:=/etc/nginx/certs/live/${SERVER_NAME}/fullchain.pem}"
: "${SSL_KEY_PATH:=/etc/nginx/certs/live/${SERVER_NAME}/privkey.pem}"
: "${MY_HOST:=my.loganix.com}"
: "${MY_UPSTREAM:=https://${MY_HOST}}"
: "${LETSENCRYPT_EMAIL:=info@loganix.com}"

generate_upstream_servers() {
	local servers_list=$1
	local default_server=$2
	local servers=""
	
	if [ -z "$servers_list" ]; then
		servers_list="$default_server"
	fi
	
	IFS=','
	for server in $servers_list; do
		server=$(echo "$server" | xargs)
		if [ -n "$server" ]; then
			servers="${servers}		server ${server} max_fails=3 fail_timeout=30s;
"
		fi
	done
	unset IFS
	
	if [ -z "$servers" ]; then
		servers="		server ${default_server} max_fails=3 fail_timeout=30s;
"
	fi
	
	printf '%s' "$servers"
}

BACKEND_UPSTREAM_SERVERS_GEN=$(generate_upstream_servers "$BACKEND_UPSTREAM_SERVERS" "$BACKEND_UPSTREAM")
FRONTEND_UPSTREAM_SERVERS_GEN=$(generate_upstream_servers "$FRONTEND_UPSTREAM_SERVERS" "$FRONTEND_UPSTREAM")

if [ -z "$BACKEND_UPSTREAM_SERVERS_GEN" ]; then
	echo "Error: Generated backend upstream servers is empty"
	exit 1
fi

if [ -z "$FRONTEND_UPSTREAM_SERVERS_GEN" ]; then
	echo "Error: Generated frontend upstream servers is empty"
	exit 1
fi

export SERVER_NAME FRONTEND_PATH BACKEND_PATH
export SSL_CERT_PATH SSL_KEY_PATH MY_UPSTREAM MY_HOST ENABLE_SSL
export BACKEND_UPSTREAM_SERVERS FRONTEND_UPSTREAM_SERVERS
export BACKEND_HEALTHCHECK_URL FRONTEND_HEALTHCHECK_URL

if [ "${ENABLE_SSL}" = "false" ] && [ -f "${SSL_CERT_PATH}" ] && [ -f "${SSL_KEY_PATH}" ]; then
	ENABLE_SSL="true"
fi

if [ "${ENABLE_SSL}" = "true" ]; then
	if [ ! -f "${SSL_CERT_PATH}" ] || [ ! -f "${SSL_KEY_PATH}" ]; then
		echo "Warning: SSL enabled but certificates not found at ${SSL_CERT_PATH} and ${SSL_KEY_PATH}"
		echo "Disabling SSL. Set ENABLE_SSL=false or provide valid certificates."
		ENABLE_SSL="false"
	fi
fi

if [ "${ENABLE_SSL}" = "true" ]; then
	HTTP_REDIRECT_TO_HTTPS="return 301 https://\$host\$request_uri;"
else
	HTTP_REDIRECT_TO_HTTPS=""
fi

TEMP_CONFIG=$(mktemp)
envsubst '\n\r\t $SERVER_NAME $FRONTEND_PATH $BACKEND_PATH $SSL_CERT_PATH $SSL_KEY_PATH $MY_UPSTREAM $MY_HOST $ENABLE_SSL $BACKEND_HEALTHCHECK_URL $FRONTEND_HEALTHCHECK_URL' \
  < /etc/nginx/templates/nginx.tmpl.conf > "$TEMP_CONFIG"

sed -i "s|\${HTTP_REDIRECT_TO_HTTPS}|${HTTP_REDIRECT_TO_HTTPS}|g" "$TEMP_CONFIG"

FINAL_TEMP=$(mktemp)
while IFS= read -r line || [ -n "$line" ]; do
	if echo "$line" | grep -q '\${BACKEND_UPSTREAM_SERVERS}'; then
		printf '%s' "$BACKEND_UPSTREAM_SERVERS_GEN"
	elif echo "$line" | grep -q '\${FRONTEND_UPSTREAM_SERVERS}'; then
		printf '%s' "$FRONTEND_UPSTREAM_SERVERS_GEN"
	else
		printf '%s\n' "$line"
	fi
done < "$TEMP_CONFIG" > "$FINAL_TEMP"
mv "$FINAL_TEMP" "$TEMP_CONFIG"

if [ "${ENABLE_SSL}" = "true" ]; then
	HTTPS_BLOCK_FILE=$(mktemp)
	
	# Main domain HTTPS block
	cat > "$HTTPS_BLOCK_FILE" <<HTTPS_EOF
	server {
		listen 443 ssl;
		http2 on;
		server_name ${SERVER_NAME};

		ssl_certificate     ${SSL_CERT_PATH};
		ssl_certificate_key ${SSL_KEY_PATH};
		ssl_session_timeout 1d;
		ssl_session_cache shared:SSL:10m;
		ssl_session_tickets off;
		ssl_protocols TLSv1.2 TLSv1.3;
		ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
		ssl_prefer_server_ciphers off;

		# Backend healthcheck endpoint
		location ${BACKEND_HEALTHCHECK_URL} {
			access_log off;
			proxy_pass http://backend_upstream${BACKEND_HEALTHCHECK_URL};
			proxy_set_header Host \$host;
			proxy_connect_timeout 2s;
			proxy_read_timeout 3s;
		}

		# Backend API
		location ${BACKEND_PATH} {
			proxy_pass http://backend_upstream;
			proxy_set_header Host \$host;
			proxy_set_header X-Real-IP \$remote_addr;
			proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto \$scheme;
			proxy_http_version 1.1;
			proxy_set_header Upgrade \$http_upgrade;
			proxy_set_header Connection \$connection_upgrade;
			proxy_read_timeout 300s;
			proxy_connect_timeout 5s;
			proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
			proxy_next_upstream_tries 3;
			proxy_next_upstream_timeout 10s;
		}

		# Frontend healthcheck endpoint
		location ${FRONTEND_HEALTHCHECK_URL} {
			access_log off;
			proxy_pass http://frontend_upstream${FRONTEND_HEALTHCHECK_URL};
			proxy_set_header Host \$host;
			proxy_connect_timeout 2s;
			proxy_read_timeout 3s;
		}

		# Frontend routes
		location ${FRONTEND_PATH} {
			proxy_pass http://frontend_upstream;
			proxy_set_header Host \$host;
			proxy_set_header X-Real-IP \$remote_addr;
			proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto \$scheme;
			proxy_http_version 1.1;
			proxy_set_header Upgrade \$http_upgrade;
			proxy_set_header Connection \$connection_upgrade;
			proxy_read_timeout 300s;
			proxy_connect_timeout 5s;
			proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
			proxy_next_upstream_tries 3;
			proxy_next_upstream_timeout 10s;
		}

		# SPP (${MY_HOST}) reverse proxy fallback
		# location / {
		# 	proxy_pass ${MY_UPSTREAM};
		# 	proxy_set_header Host "${MY_HOST}";
		# 	proxy_set_header X-Real-IP \$remote_addr;
		# 	proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		# 	proxy_set_header X-Forwarded-Proto \$scheme;
		# 	proxy_ssl_server_name on;
		# 	proxy_set_header Accept-Encoding "";
		# 	sub_filter "https://${MY_HOST}" 'https://\$host';
		# 	sub_filter "http://${MY_HOST}" 'https://\$host';
		# 	sub_filter "${MY_HOST}" '\$host';
		# 	sub_filter_once off;
		# 	proxy_redirect default;
		# 	proxy_redirect ~^https?://${MY_HOST//./\\.}(/.*)$ https://\$host\$1;
		# 	proxy_redirect ~^https?://${MY_HOST//./\\.}$ https://\$host;
		# }
	}
HTTPS_EOF

	FINAL_CONFIG=$(mktemp)
	while IFS= read -r line; do
		case "$line" in
			*'${HTTPS_SERVER_BLOCK}'*)
				cat "$HTTPS_BLOCK_FILE"
				;;
			*)
				echo "$line"
				;;
		esac
	done < "$TEMP_CONFIG" > "$FINAL_CONFIG"
	mv "$FINAL_CONFIG" "$TEMP_CONFIG"
	rm "$HTTPS_BLOCK_FILE"
else
	sed -i '/\${HTTPS_SERVER_BLOCK}/d' "$TEMP_CONFIG"
fi

mv "$TEMP_CONFIG" /etc/nginx/nginx.conf

nginx -g 'daemon off;' &
NGINX_PID=$!

/healthcheck.sh &
HEALTHCHECK_PID=$!

wait $NGINX_PID
HEALTHCHECK_EXIT=$?

kill $HEALTHCHECK_PID 2>/dev/null || true
exit $HEALTHCHECK_EXIT
