#!/bin/sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

domain="${DOMAIN:-timesheet.mehmetfk.com}"
email="${LETSENCRYPT_EMAIL:-mk@alef.at}"
rsa_key_size=4096

if [ -z "$email" ]; then
  echo "LETSENCRYPT_EMAIL is not configured."
  echo "Add LETSENCRYPT_EMAIL=you@example.com to .env and run this script again."
  exit 1
fi

echo "Creating temporary certificate for $domain..."
docker compose run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$domain && \
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout /etc/letsencrypt/live/$domain/privkey.pem \
    -out /etc/letsencrypt/live/$domain/fullchain.pem \
    -subj /CN=localhost'" certbot

echo "Starting app and nginx..."
docker compose up -d --build nginx

echo "Deleting temporary certificate..."
docker compose run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$domain \
    /etc/letsencrypt/archive/$domain \
    /etc/letsencrypt/renewal/$domain.conf" certbot

echo "Requesting Let's Encrypt certificate for $domain..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $email \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $domain" certbot

echo "Reloading nginx..."
docker compose exec nginx nginx -s reload

echo "Done. Open https://$domain"
