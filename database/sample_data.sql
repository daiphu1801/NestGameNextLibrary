-- ========================================
-- NestGame - Import games từ JSON
-- Script này tạo từ games.json
-- ========================================

-- Chạy file này SAU KHI đã chạy schema.sql

-- Ví dụ insert games (Spring Boot sẽ tự động import từ JSON)
-- Đây chỉ là mẫu để test

INSERT INTO games (name, file_name, path, category_id, description, rating, year, region, is_featured, image_url, image_snap, image_title) VALUES

-- Featured Games (Rating 5, isFeatured = true)
('Contra', 'Contra (U).zip', 'Contra (U).zip', 
    (SELECT id FROM categories WHERE name = 'platformer'),
    'Game run-and-gun huyền thoại với chế độ 2 người chơi. Region: 🇺🇸 USA',
    5, 1988, '🇺🇸 USA', TRUE,
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Boxarts/Contra%20(USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Contra%20(USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Titles/Contra%20(USA).png'),

('Super Mario Bros', 'Super Mario Bros (U).zip', 'Super Mario Bros (U).zip',
    (SELECT id FROM categories WHERE name = 'platformer'),
    'Game platformer huyền thoại. Region: 🇺🇸 USA',
    5, 1985, '🇺🇸 USA', TRUE,
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Boxarts/Super%20Mario%20Bros%20(USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Super%20Mario%20Bros%20(USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Titles/Super%20Mario%20Bros%20(USA).png'),

-- Regular Games
('1942', '1942 (JU) [!].zip', '1942 (JU) [!].zip',
    (SELECT id FROM categories WHERE name = 'shooter'),
    'Game bắn súng hành động. Region: 🇯🇵🇺🇸 Japan/USA, ✅ Verified',
    4, NULL, '🇯🇵🇺🇸 Japan/USA', FALSE,
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Boxarts/1942%20(Japan%2C%20USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/1942%20(Japan%2C%20USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Titles/1942%20(Japan%2C%20USA).png'),

('Adventures in the Magic Kingdom', 'Adventures in the Magic Kingdom (U).zip', 'Adventures in the Magic Kingdom (U).zip',
    (SELECT id FROM categories WHERE name = 'adventure'),
    'Game phiêu lưu khám phá. Region: 🇺🇸 USA',
    3, NULL, '🇺🇸 USA', FALSE,
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Boxarts/Adventures%20in%20the%20Magic%20Kingdom%20(USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Adventures%20in%20the%20Magic%20Kingdom%20(USA).png',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Titles/Adventures%20in%20the%20Magic%20Kingdom%20(USA).png');

-- NOTE: ~1700 games sẽ được import tự động khi Spring Boot khởi động
-- bằng cách đọc file games.json và insert vào database
