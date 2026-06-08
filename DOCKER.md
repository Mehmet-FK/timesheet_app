# Docker HTTPS deployment on Ubuntu VPS

This setup runs:

- Next.js app privately inside Docker
- PostgreSQL with a persistent Docker volume
- Nginx on ports `80` and `443`
- Certbot for Let's Encrypt certificates

The public domain is:

```text
timesheet.mehmetfk.com
```

## 1. Point DNS to the VPS

Create an `A` record at your DNS provider:

```text
timesheet.mehmetfk.com -> YOUR_SERVER_IPV4
```

If your VPS has IPv6, optionally add an `AAAA` record too.

Wait until DNS resolves:

```bash
dig timesheet.mehmetfk.com
```

## 2. Open firewall ports

On Ubuntu with UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Also make sure your VPS provider firewall allows inbound `80` and `443`.

## 3. Install Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 4. Configure environment

```bash
cp .env.docker.example .env
nano .env
```

Use a strong `POSTGRES_PASSWORD`. Avoid special URL characters such as `@`, `/`,
`:` and `#` unless you also URL-encode them.

Set:

```env
DOMAIN=timesheet.mehmetfk.com
LETSENCRYPT_EMAIL=your-real-email@example.com
COOKIE_SECURE=true
HTTP_PORT=80
HTTPS_PORT=443
```

## 5. Create the first certificate

Run this only the first time:

```bash
chmod +x scripts/init-letsencrypt.sh scripts/renew-letsencrypt.sh
./scripts/init-letsencrypt.sh
```

The script creates a temporary certificate, starts Nginx, requests the real
Let's Encrypt certificate, then reloads Nginx.

Open:

```text
https://timesheet.mehmetfk.com
```

## 6. Create the first admin

```bash
docker compose exec app npm run admin:create -- mk@alef.at 'Admin@Alef0415+'
```

Then open:

```text
https://timesheet.mehmetfk.com/admin
```

## 7. Renew certificates

Let's Encrypt certificates are valid for about 90 days. Add a cron job:

```bash
crontab -e
```

Add:

```cron
0 3 * * * cd /path/to/timesheet_app && ./scripts/renew-letsencrypt.sh >> /var/log/timesheet-certbot.log 2>&1
```

Certbot renews only when needed.

## Useful commands

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f nginx
docker compose logs -f postgres
docker compose restart app
docker compose down
```

Rebuild after code changes:

```bash
docker compose up -d --build
```

Stop without deleting the database:

```bash
docker compose down
```

Delete the database and certificates too:

```bash
docker compose down -v
```
