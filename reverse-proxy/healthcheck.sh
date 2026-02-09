#!/bin/sh
set -euo pipefail

: "${BACKEND_UPSTREAM_SERVERS:=}"
: "${FRONTEND_UPSTREAM_SERVERS:=}"
: "${CMS_UPSTREAM_SERVERS:=}"
: "${BACKEND_UPSTREAM:=http://127.0.0.1:3000}"
: "${FRONTEND_UPSTREAM:=http://127.0.0.1:4321}"
: "${CMS_UPSTREAM:=http://127.0.0.1:8055}"
: "${BACKEND_HEALTHCHECK_URL:=/health}"
: "${FRONTEND_HEALTHCHECK_URL:=/health}"
: "${CMS_HEALTHCHECK_URL:=/server/health}"
: "${HEALTHCHECK_INTERVAL:=10}"
: "${ENABLE_SSL:=false}"

ensure_leading_slash() {
	local path="$1"
	path=$(echo "$path" | xargs)
	if [ -z "$path" ]; then
		echo "/"
	elif [ "${path#/}" = "$path" ]; then
		echo "/$path"
	else
		echo "$path"
	fi
}

normalize_base_url() {
	local raw_url="$1"
	local default_scheme="$2"

	raw_url=$(echo "$raw_url" | xargs)

	if [ -z "$raw_url" ]; then
		echo ""
		return
	fi

	if printf '%s' "$raw_url" | grep -Eq '^[A-Za-z][A-Za-z0-9+.-]*://'; then
		raw_url=${raw_url%/}
		echo "$raw_url"
	else
		raw_url=${raw_url%/}
		echo "${default_scheme}://${raw_url}"
	fi
}

build_health_url() {
	local base_url="$1"
	local health_path="$2"

	if [ -z "$base_url" ]; then
		echo ""
		return
	fi

	local sanitized_path
	sanitized_path=$(ensure_leading_slash "$health_path")
	base_url=${base_url%/}
	echo "${base_url}${sanitized_path}"
}

perform_request() {
	local url="$1"

	if printf '%s' "$url" | grep -q '^https://'; then
		wget -qO- --timeout=3 --tries=1 --no-check-certificate --user-agent='Reverse-Proxy-Healthcheck' "$url" > /dev/null 2>&1
	else
		wget -qO- --timeout=3 --tries=1 --user-agent='Reverse-Proxy-Healthcheck' "$url" > /dev/null 2>&1
	fi
}

check_health_via_nginx() {
	local health_url="$1"
	local protocol="http"
	local port=80

	if [ "${ENABLE_SSL}" = "true" ]; then
		protocol="https"
		port=443
	fi

	local base="${protocol}://127.0.0.1:${port}"
	local full_url
	full_url=$(build_health_url "$base" "$health_url")

	if [ -z "$full_url" ]; then
		return 1
	fi

	if [ "$protocol" = "https" ]; then
		wget -qO- --timeout=3 --tries=1 --no-check-certificate --user-agent='Reverse-Proxy-Healthcheck' "$full_url" > /dev/null 2>&1
	else
		wget -qO- --timeout=3 --tries=1 --user-agent='Reverse-Proxy-Healthcheck' "$full_url" > /dev/null 2>&1
	fi
}

get_servers_list() {
	local servers_list="$1"
	local default_server="$2"

	if [ -z "$servers_list" ]; then
		echo "$default_server"
	else
		echo "$servers_list"
	fi
}

echo "Starting health checker (interval: ${HEALTHCHECK_INTERVAL}s)"
echo "Backend healthcheck URL: ${BACKEND_HEALTHCHECK_URL}"
echo "Frontend healthcheck URL: ${FRONTEND_HEALTHCHECK_URL}"
echo "CMS healthcheck URL: ${CMS_HEALTHCHECK_URL}"
echo "Backend upstream servers: ${BACKEND_UPSTREAM_SERVERS:-${BACKEND_UPSTREAM}}"
echo "Frontend upstream servers: ${FRONTEND_UPSTREAM_SERVERS:-${FRONTEND_UPSTREAM}}"
echo "CMS upstream servers: ${CMS_UPSTREAM_SERVERS:-${CMS_UPSTREAM}}"

while true; do
	BACKEND_SERVERS=$(get_servers_list "$BACKEND_UPSTREAM_SERVERS" "$BACKEND_UPSTREAM")
	FRONTEND_SERVERS=$(get_servers_list "$FRONTEND_UPSTREAM_SERVERS" "$FRONTEND_UPSTREAM")
	CMS_SERVERS=$(get_servers_list "$CMS_UPSTREAM_SERVERS" "$CMS_UPSTREAM")

	if [ -n "$BACKEND_SERVERS" ]; then
		IFS=','
		for server in $BACKEND_SERVERS; do
			server=$(echo "$server" | xargs)
			if [ -n "$server" ]; then
				base_url=$(normalize_base_url "$server" "http")
				full_url=$(build_health_url "$base_url" "$BACKEND_HEALTHCHECK_URL")
				if [ -n "$full_url" ]; then
					if ! perform_request "$full_url"; then
						echo "$(date -Iseconds): Backend server ${full_url} health check failed"
					fi
				fi
			fi
		done
		unset IFS

		if ! check_health_via_nginx "$BACKEND_HEALTHCHECK_URL"; then
			echo "$(date -Iseconds): Backend health check via nginx failed"
		fi
	fi

	if [ -n "$FRONTEND_SERVERS" ]; then
		IFS=','
		for server in $FRONTEND_SERVERS; do
			server=$(echo "$server" | xargs)
			if [ -n "$server" ]; then
				base_url=$(normalize_base_url "$server" "http")
				full_url=$(build_health_url "$base_url" "$FRONTEND_HEALTHCHECK_URL")
				if [ -n "$full_url" ]; then
					if ! perform_request "$full_url"; then
						echo "$(date -Iseconds): Frontend server ${full_url} health check failed"
					fi
				fi
			fi
		done
		unset IFS

		if ! check_health_via_nginx "$FRONTEND_HEALTHCHECK_URL"; then
			echo "$(date -Iseconds): Frontend health check via nginx failed"
		fi
	fi

	if [ -n "$CMS_SERVERS" ]; then
		IFS=','
		for server in $CMS_SERVERS; do
			server=$(echo "$server" | xargs)
			if [ -n "$server" ]; then
				base_url=$(normalize_base_url "$server" "http")
				full_url=$(build_health_url "$base_url" "$CMS_HEALTHCHECK_URL")
				if [ -n "$full_url" ]; then
					if ! perform_request "$full_url"; then
						echo "$(date -Iseconds): CMS server ${full_url} health check failed"
					fi
				fi
			fi
		done
		unset IFS

		if ! check_health_via_nginx "$CMS_HEALTHCHECK_URL"; then
			echo "$(date -Iseconds): CMS health check via nginx failed"
		fi
	fi

	sleep "$HEALTHCHECK_INTERVAL"
done

