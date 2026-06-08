# Docker deployment on Ubuntu VPS

## 1. Install Docker

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

## 2. Configure environment

```bash
cp .env.docker.example .env
nano .env
```

Use a strong `POSTGRES_PASSWORD`. Avoid special URL characters such as `@`, `/`,
`:` and `#` unless you also URL-encode them.

Keep `COOKIE_SECURE=false` while you open the app through plain HTTP, for
example `http://YOUR_SERVER_IP:3000`. Set it to `true` after you put the app
behind HTTPS.

## 3. Build and start

```bash
docker compose up -d --build
```

The app container waits for PostgreSQL and runs all migrations automatically.

Open:

```text
http://YOUR_SERVER_IP:3000
```

## 4. Create the first admin

```bash
docker compose exec app npm run admin:create -- admin@example.com secure-password
```

Then open:

```text
http://YOUR_SERVER_IP:3000/admin
```

## Useful commands

```bash
docker compose logs -f app
docker compose logs -f postgres
docker compose restart app
docker compose down
```

To stop without deleting the database:

```bash
docker compose down
```

To delete the database volume too:

```bash
docker compose down -v
```
