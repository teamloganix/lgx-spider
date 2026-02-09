#!/bin/sh
set -euo pipefail

SERVER_NAME="${SERVER_NAME:-}"
CMS_SERVER_NAME="${CMS_SERVER_NAME:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-info@loganix.com}"
CERTBOT_STAGING="${CERTBOT_STAGING:-false}"

STAGING_FLAG=""
if [ "${CERTBOT_STAGING}" = "true" ]; then
	STAGING_FLAG="--staging"
fi

echo "Waiting for nginx to be ready..."
sleep 10

# Request certificate for main domain
if [ -n "${SERVER_NAME}" ] && [ "${SERVER_NAME}" != "localhost" ]; then
	if [ -f "/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem" ]; then
		echo "Certificate already exists for ${SERVER_NAME}, skipping initialization"
	else
		echo "Initializing Let's Encrypt certificate for ${SERVER_NAME}"
		certbot certonly \
			--webroot \
			--webroot-path=/var/www/certbot \
			--email "${LETSENCRYPT_EMAIL}" \
			--agree-tos \
			--no-eff-email \
			--force-renewal \
			${STAGING_FLAG} \
			-d "${SERVER_NAME}"
		echo "Certificate initialized successfully for ${SERVER_NAME}"
	fi
fi

# Request certificate for CMS domain
if [ -n "${CMS_SERVER_NAME}" ] && [ "${CMS_SERVER_NAME}" != "localhost" ]; then
	if [ -f "/etc/letsencrypt/live/${CMS_SERVER_NAME}/fullchain.pem" ]; then
		echo "Certificate already exists for ${CMS_SERVER_NAME}, skipping initialization"
	else
		echo "Initializing Let's Encrypt certificate for ${CMS_SERVER_NAME}"
		certbot certonly \
			--webroot \
			--webroot-path=/var/www/certbot \
			--email "${LETSENCRYPT_EMAIL}" \
			--agree-tos \
			--no-eff-email \
			--force-renewal \
			${STAGING_FLAG} \
			-d "${CMS_SERVER_NAME}"
		echo "Certificate initialized successfully for ${CMS_SERVER_NAME}"
	fi
fi

echo "Certificate initialization completed"

