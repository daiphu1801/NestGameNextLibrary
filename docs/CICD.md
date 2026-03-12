# NestGame - Hướng Dẫn CI/CD với GitHub Actions

## Tổng Quan

Mỗi khi push code lên nhánh `main` và có thay đổi trong thư mục `backend/`, GitHub Actions tự động:

```
git push → GitHub Actions
              ├── 1. Build Docker image (Spring Boot)
              ├── 2. Push lên GitHub Container Registry (ghcr.io)
              └── 3. SSH vào Droplet → docker pull → restart backend
```

---

## Cấu Trúc Files

```
.github/
└── workflows/
    └── deploy-backend.yml   ← File workflow chính
```

---

## Thiết Lập Lần Đầu

### Bước 1 - Tạo GitHub Secrets

Vào **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Giá trị | Lấy từ đâu |
|-------------|---------|-----------|
| `DO_HOST` | IP của Droplet | DO Dashboard → Droplets |
| `DO_SSH_PRIVATE_KEY` | Nội dung SSH private key | Xem hướng dẫn dưới |

**Lấy SSH private key:**
```bash
# Windows CMD
type %USERPROFILE%\.ssh\id_ed25519

# PowerShell / Linux / Mac
cat ~/.ssh/id_ed25519
```

Copy toàn bộ từ `-----BEGIN OPENSSH PRIVATE KEY-----` đến `-----END OPENSSH PRIVATE KEY-----`.

---

### Bước 2 - Cập nhật docker-compose.yml trên server

SSH vào Droplet, sửa `/app/docker-compose.yml`:

```yaml
# Đổi image của backend từ:
image: nestgame-backend:latest

# Thành:
image: ghcr.io/<github_username>/nestgame-backend:latest
```

---

## File Workflow Giải Thích

```yaml
name: Deploy Backend to Digital Ocean

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'    # Chỉ chạy khi có thay đổi trong backend/
```

> **paths** giúp tránh deploy lại khi chỉ sửa frontend hoặc docs.

---

### Job: build-and-deploy

**Step 1 - Checkout code**
```yaml
- uses: actions/checkout@v4
```
Clone repo về GitHub Actions runner.

---

**Step 2 - Login GHCR**
```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```
`GITHUB_TOKEN` là token tự động, không cần tạo thêm secret.

---

**Step 3 - Build và Push image**
```yaml
- uses: docker/build-push-action@v5
  with:
    context: ./backend
    push: true
    pull: true          # Force pull base image mới nhất → fix CVEs
    tags: ghcr.io/<username>/nestgame-backend:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

`cache-from/cache-to` giúp tái sử dụng Docker layer cache → build nhanh hơn từ lần 2 trở đi.

---

**Step 4 - Deploy lên Droplet**
```yaml
- uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.DO_HOST }}
    username: root
    key: ${{ secrets.DO_SSH_PRIVATE_KEY }}
    script: |
      echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u daiphu1801 --password-stdin
      cd /app
      docker compose pull backend
      docker compose up -d --force-recreate backend
      docker image prune -f    # Dọn image cũ tiết kiệm disk
```

---

## Quy Trình Sử Dụng Hằng Ngày

### Deploy backend mới

Chỉ cần push code, mọi thứ tự động:

```bash
git add .
git commit -m "feat: thêm tính năng mới"
git push origin main
```

Theo dõi tiến trình tại:
```
https://github.com/<username>/NestGameNextLibrary/actions
```

---

### Khi nào workflow KHÔNG chạy

Workflow chỉ trigger khi có thay đổi trong `backend/**`. Các trường hợp sau sẽ **không** trigger deploy:

- Sửa frontend (`frontend/**`)
- Sửa docs (`docs/**`)
- Sửa `.github/workflows/`
- Sửa `README.md`

---

### Deploy thủ công (Manual Trigger)

Nếu muốn deploy mà không cần push code, thêm trigger `workflow_dispatch` vào file workflow:

```yaml
on:
  push:
    branches: [main]
    paths: ['backend/**']
  workflow_dispatch:    # Thêm dòng này
```

Sau đó vào **GitHub → Actions → Deploy Backend → Run workflow**.

---

## Xử Lý Lỗi Thường Gặp

### Lỗi: Permission denied (SSH)
```
ssh: connect to host xxx port 22: Connection refused
```
**Fix:** Kiểm tra secret `DO_HOST` có đúng IP không, và SSH key đã được add vào Droplet chưa.

---

### Lỗi: unauthorized (GHCR pull trên server)
```
Error response from daemon: unauthorized
```
**Fix:** Chạy lại login trên server:
```bash
echo <GITHUB_TOKEN> | docker login ghcr.io -u <github_username> --password-stdin
```

---

### Lỗi: Build failed (Maven compile error)
Xem log tại GitHub Actions → click vào workflow run → step **Build and push Docker image**.

Fix code → push lại → workflow tự chạy lại.

---

### Lỗi: No space left on device (Droplet hết disk)
```bash
# SSH vào Droplet, dọn Docker
docker system prune -af
docker volume prune -f
```

---

## So Sánh Deploy Thủ Công vs CI/CD

| | Deploy Thủ Công | CI/CD (GitHub Actions) |
|--|----------------|----------------------|
| Số lệnh phải chạy | 4 lệnh | 1 lệnh (`git push`) |
| Base image update | Phải thêm `--pull` manual | Tự động (`pull: true`) |
| Theo dõi lịch sử | Không có | GitHub Actions log |
| Rollback | Khó | Dễ (re-run workflow cũ) |
| Build time lần 2+ | Không cache | Nhanh hơn (layer cache) |

---

## Thông Tin

| | |
|---|---|
| Registry | `ghcr.io/daiphu1801/nestgame-backend` |
| Workflow file | `.github/workflows/deploy-backend.yml` |
| Trigger | Push to `main` với thay đổi trong `backend/` |
| Runner | `ubuntu-latest` (GitHub hosted) |
| GitHub Actions free quota | 2,000 phút/tháng (đủ dùng) |
