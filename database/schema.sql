-- ========================================
-- NestGame Database Schema - PostgreSQL
-- Recreation Script with DROP/CREATE
-- ========================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS password_reset_otp CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS play_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ========================================
-- CREATE TABLES
-- ========================================

-- 1. TABLE: categories (Lookup table cho game categories)
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,      -- platformer, rpg, shooter, etc.
    display_name VARCHAR(100) NOT NULL,    -- Tên hiển thị
    icon VARCHAR(50),                       -- Icon emoji hoặc class
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE: games (Chứa dữ liệu từ games.json)
CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,             -- Tên game
    file_name VARCHAR(500) NOT NULL,        -- Tên file ROM
    path VARCHAR(500) NOT NULL,             -- Đường dẫn ROM
    category_id BIGINT REFERENCES categories(id),
    description TEXT,                       -- Mô tả game
    rating DOUBLE PRECISION CHECK (rating >= 0 AND rating <= 5),  -- 0-5
    year INTEGER CHECK (year >= 1970 AND year <= 2030),
    region VARCHAR(100),                    -- Japan, USA, Europe, etc.
    is_featured BOOLEAN DEFAULT FALSE,      -- Game nổi bật
    image_url VARCHAR(500),                 -- URL ảnh boxart
    image_snap VARCHAR(500),                -- URL ảnh gameplay
    image_title VARCHAR(500),               -- URL ảnh title screen
    play_count INTEGER DEFAULT 0,           -- Số lượt chơi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index cho search và filter
CREATE INDEX idx_games_name ON games(name);
CREATE INDEX idx_games_category ON games(category_id);
CREATE INDEX idx_games_rating ON games(rating DESC);
CREATE INDEX idx_games_is_featured ON games(is_featured) WHERE is_featured = TRUE;

-- 3. TABLE: users (User accounts)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,    -- BCrypt hashed
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'USER',        -- USER, ADMIN
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 4. TABLE: favorites (User's favorite games)
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)                -- Mỗi user chỉ favorite 1 game 1 lần
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_game ON favorites(game_id);

-- 5. TABLE: play_history (Lịch sử chơi game)
CREATE TABLE play_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0      -- Thời gian chơi (giây)
);

CREATE INDEX idx_play_history_user ON play_history(user_id);
CREATE INDEX idx_play_history_game ON play_history(game_id);
CREATE INDEX idx_play_history_played_at ON play_history(played_at DESC);

-- 6. TABLE: refresh_tokens (JWT refresh tokens)
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 7. TABLE: password_reset_otp (Quên mật khẩu - OTP qua Gmail)
CREATE TABLE password_reset_otp (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_otp_email ON password_reset_otp(email);

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Categories
INSERT INTO categories (name, display_name, icon) VALUES
('all', 'Tất cả', '🎮'),
('platformer', 'Platformer', '🏃'),
('rpg', 'RPG', '⚔️'),
('sports', 'Thể thao', '⚽'),
('fighting', 'Đối kháng', '🥊'),
('puzzle', 'Puzzle', '🧩'),
('racing', 'Đua xe', '🏎️'),
('shooter', 'Bắn súng', '🔫'),
('strategy', 'Chiến thuật', '♟️'),
('adventure', 'Phiêu lưu', '🗺️'),
('action', 'Hành động', '💥'),
('arcade', 'Arcade', '👾'),
('simulation', 'Mô phỏng', '🎯'),
('other', 'Khác', '📦');

-- Admin user (password: admin123 - sẽ hash trong Spring Boot)
-- INSERT INTO users (email, username, password_hash, role) VALUES
-- ('admin@nestgame.com', 'admin', '$2a$10$...', 'ADMIN');
