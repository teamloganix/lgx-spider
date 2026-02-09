#!/bin/sh
set -euo pipefail

echo "Renewing Let's Encrypt certificates"

certbot renew --webroot --webroot-path=/var/www/certbot --quiet

if [ $? -eq 0 ]; then
	echo "Certificates renewed successfully"
	echo "Please reload nginx container to apply new certificates"
else
	echo "Certificate renewal failed or not needed"
fi