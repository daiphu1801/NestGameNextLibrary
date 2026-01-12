# NestGame Database

## PostgreSQL Setup

### 1. Cài đặt PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Hoặc dùng Docker (recommend):

```bash
docker run --name nestgame-postgres \
  -e POSTGRES_DB=nestgame \
  -e POSTGRES_USER=nestgame \
  -e POSTGRES_PASSWORD=nestgame123 \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. Tạo Database

```sql
-- Kết nối PostgreSQL và chạy:
CREATE DATABASE nestgame;
```

### 3. Chạy Schema

```bash
psql -U nestgame -d nestgame -f schema.sql
```

### 4. (Optional) Chạy Sample Data

```bash
psql -U nestgame -d nestgame -f sample_data.sql
```

---

## Database Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  categories  │     │      games       │     │    users     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │────<│ category_id (FK) │     │ id (PK)      │
│ name         │     │ id (PK)          │>────│ email        │
│ display_name │     │ name             │     │ username     │
│ icon         │     │ file_name        │     │ password_hash│
└──────────────┘     │ path             │     │ role         │
                     │ description      │     └──────────────┘
                     │ rating           │            │
                     │ year             │            │
                     │ region           │     ┌──────┴───────┐
                     │ is_featured      │     │              │
                     │ image_url        │     ▼              ▼
                     │ image_snap       │  ┌────────────┐  ┌────────────┐
                     │ image_title      │  │ favorites  │  │play_history│
                     │ play_count       │  ├────────────┤  ├────────────┤
                     └──────────────────┘  │user_id(FK) │  │user_id(FK) │
                             │             │game_id(FK) │  │game_id(FK) │
                             │             └────────────┘  │played_at   │
                             └──────────────────────────────│duration    │
                                                            └────────────┘
```

---

## Connection Info (Dev)

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | nestgame |
| Username | nestgame |
| Password | nestgame123 |

Spring Boot: `application.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/nestgame
    username: nestgame
    password: nestgame123
    driver-class-name: org.postgresql.Driver
```
