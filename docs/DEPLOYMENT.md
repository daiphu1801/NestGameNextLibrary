# NestGame - Hướng Dẫn Deploy Production

## Kiến Trúc Hệ Thống

```
User
 │
 ├── https://nestgame.me        → Vercel (Next.js Frontend)
 │                                    │
 │                                    │ API calls
 │                                    ▼
 └── https://api.nestgame.me   → Digital Ocean Droplet
                                      │
                                      ├── Nginx (reverse proxy, SSL)
                                      │     └── port 443 → localhost:8080
                                      │
                                      └── Docker Compose
                                            ├── Spring Boot Backend (port 8080)
                                            └── PostgreSQL Database (port 5432)
```

---

## Yêu Cầu Ban Đầu

- Tài khoản [Vercel](https://vercel.com) (miễn phí)
- Tài khoản [Digital Ocean](https://digitalocean.com) (+ $200 credit GitHub Student)
- Tài khoản [Namecheap](https://namecheap.com) + domain `.me` miễn phí (GitHub Student)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) cài trên máy local
- SSH key đã tạo

---

## Phần 1 - Lấy Domain Miễn Phí

### 1.1 GitHub Student Pack
Vào [education.github.com/pack](https://education.github.com/pack):
- **Namecheap** → claim 1 năm `.me` domain miễn phí
- **Digital Ocean** → claim $200 credit

### 1.2 Trỏ DNS về Vercel
Vào Namecheap → **Advanced DNS** → thêm records:

| Type | Host | Value |
|------|------|-------|
| A Record | @ | `76.76.21.21` |
| CNAME Record | www | `cname.vercel-dns.com` |

### 1.3 Add Domain vào Vercel
Vercel Dashboard → Project → Settings → Domains → Add `nestgame.me`

---

## Phần 2 - Tạo Droplet Digital Ocean

### 2.1 Tạo Droplet
1. DO Dashboard → **Create → Droplets**
2. Chọn cấu hình:
   - **Region:** Singapore (gần VN nhất)
   - **OS:** Ubuntu 24.04 LTS
   - **Plan:** Basic Regular → **2GB RAM / 1 vCPU / 50GB SSD → $12/tháng**
   - **Authentication:** SSH Key
   - **Hostname:** `nestgame-backend`
3. Click **Create Droplet**

### 2.2 Tạo SSH Key (nếu chưa có)
```bash
ssh-keygen -t ed25519 -C "nestgame-do"
```

Lấy public key:
```bash
# Windows CMD
type %USERPROFILE%\.ssh\id_ed25519.pub

# PowerShell / Linux / Mac
cat ~/.ssh/id_ed25519.pub
```

Copy output → paste vào Namecheap khi tạo Droplet.

---

## Phần 3 - Cài Đặt Server

### 3.1 SSH vào Droplet
```bash
ssh root@<IP_DROPLET>
```

### 3.2 Cài Docker
```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y
```

### 3.3 Tạo thư mục app
```bash
mkdir /app && cd /app
```

### 3.4 Tạo docker-compose.yml
```bash
nano /app/docker-compose.yml
```

Nội dung:
```yaml
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: NestGameDB
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: <DB_PASSWORD>
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    image: nestgame-backend:latest
    restart: always
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILE: prod
      DB_URL: jdbc:postgresql://db:5432/NestGameDB
      DB_USERNAME: postgres
      DB_PASSWORD: <DB_PASSWORD>
      JWT_SECRET: <JWT_SECRET>
      MAIL_USERNAME: <GMAIL>
      MAIL_PASSWORD: <GMAIL_APP_PASSWORD>
      CLOUDINARY_CLOUD_NAME: <CLOUD_NAME>
      CLOUDINARY_API_KEY: <API_KEY>
      CLOUDINARY_API_SECRET: <API_SECRET>
      APP_FRONTEND_URL: https://nestgame.me
      FRONTEND_URL: https://nestgame.me
    depends_on:
      - db

volumes:
  pgdata:
```

### 3.5 Cài Nginx
```bash
apt install nginx certbot python3-certbot-nginx -y
```

---

## Phần 4 - Build & Deploy Docker Image

> Thực hiện trên **máy local**, không phải server.

### 4.1 Build image
```bash
cd /path/to/project/backend
docker build -t nestgame-backend:latest .
```

### 4.2 Export image
```bash
docker save nestgame-backend:latest -o nestgame-backend.tar
```

### 4.3 Upload lên server
```bash
scp nestgame-backend.tar root@<IP_DROPLET>:/app/
```

### 4.4 Load và chạy trên server
```bash
ssh root@<IP_DROPLET> "cd /app && docker load -i nestgame-backend.tar && docker compose up -d"
```

---

## Phần 5 - Setup Nginx + SSL

### 5.1 Trỏ subdomain về Droplet
Namecheap → Advanced DNS → thêm:

| Type | Host | Value |
|------|------|-------|
| A Record | api | `<IP_DROPLET>` |

Chờ DNS propagate (5-30 phút). Kiểm tra:
```bash
nslookup api.nestgame.me
```

Khi thấy IP Droplet → DNS đã xong.

### 5.2 Tạo Nginx config
```bash
nano /etc/nginx/sites-available/api.nestgame.me
```

Nội dung:
```nginx
server {
    server_name api.nestgame.me;
    listen 80;
    return 301 https://$server_name$request_uri;
}

server {
    server_name api.nestgame.me;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/api.nestgame.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nestgame.me/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

### 5.3 Enable và cấp SSL
```bash
ln -s /etc/nginx/sites-available/api.nestgame.me /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
systemctl enable nginx

certbot --nginx -d api.nestgame.me
```

---

## Phần 6 - Cập Nhật Vercel

Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.nestgame.me/api` |

Save → Vercel tự redeploy.

---

## Phần 7 - Quy Trình Update Code (Deploy Mới)

Mỗi khi sửa code backend, chạy 1 lệnh này từ máy local:

```bash
cd /path/to/project/backend
docker build -t nestgame-backend:latest . && \
docker save nestgame-backend:latest -o nestgame-backend.tar && \
scp nestgame-backend.tar root@<IP_DROPLET>:/app/ && \
ssh root@<IP_DROPLET> "cd /app && docker load -i nestgame-backend.tar && docker compose up -d --force-recreate backend"
```

---

## Phần 8 - Lệnh Quản Lý Server Thường Dùng

```bash
# Xem container đang chạy
docker compose ps

# Xem logs backend
docker compose logs backend

# Xem logs realtime
docker compose logs -f backend

# Restart backend
docker compose restart backend

# Xem logs 50 dòng cuối
docker compose logs backend | tail -50

# Xem RAM/CPU usage
docker stats

# Restart Nginx
systemctl reload nginx

# Xem trạng thái Nginx
systemctl status nginx
```

---

## Phần 9 - Kiểm Tra Hệ Thống

```bash
# Test API từ máy local
curl https://api.nestgame.me/api/games -I

# Kiểm tra DNS
nslookup api.nestgame.me
nslookup nestgame.me

# Test kết nối backend
curl -X POST https://api.nestgame.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test@test.com","password":"test"}'
```

---

## Thông Tin Hệ Thống

| Service | URL | Chi phí |
|---------|-----|---------|
| Frontend | https://nestgame.me | Miễn phí (Vercel) |
| Backend API | https://api.nestgame.me | $12/tháng (DO credit) |
| Domain | nestgame.me | Miễn phí 1 năm (GitHub Student) |
| SSL | Let's Encrypt | Miễn phí (tự gia hạn) |
| **Tổng** | | **~$0 trong ~16 tháng** |

| Server | Spec |
|--------|------|
| IP | Xem trong DO Dashboard |
| OS | Ubuntu 24.04 LTS |
| RAM | 2GB |
| SSD | 50GB |
| Region | Singapore |
