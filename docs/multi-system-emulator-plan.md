# Hỗ trợ nhiều hệ máy giả lập (SNES, GBA, Sega Genesis, GB, GBC,...)

Hiện tại, game đang sử dụng thư viện `nostalgist` (được gọi từ `emulatorService.ts`), tuy nhiên mã nguồn đang bị *hardcode* cố định chỉ chạy cho hệ máy NES (`Nostalgist.nes(...)`). Thư viện này thực chất hỗ trợ giả lập rất nhiều hệ máy khác nhau (SNES, GBA, Sega Genesis, Nintendo 64, PS1...) thông qua các lõi (core) RetroArch/Libretro.

Để ứng dụng có thể chơi được nhiều hệ máy khác nhau, cần thiết kế lại một chút từ CSDL Backend cho đến giao diện cài đặt bên Frontend. Dưới đây là ý tưởng và lộ trình thiết kế chi tiết.

## Kế hoạch triển khai (Implementation Plan)

---

### 1. Backend & Database (Java Spring Boot)
Chúng ta cần một trường mới để lưu trữ loại hệ máy (system core) của từng game (ví dụ: `nes`, `snes`, `gba`, `genesis`).

#### [MODIFY] `com.nestgame.entity.Game`
- Thêm trường `system` (hoặc `core`) kiểu String.

#### [MODIFY] DTOs & Services (Java)
- Cập nhật các DTO (Data Transfer Object) như `JsonGame.java`, `GameDTO.java`, `GameRequest.java` và `GameMapper.java` (nếu có) để bao gồm trường `system` này khi trả về cho Frontend hiển thị hoặc nhận từ trang Quản trị Admin lúc upload.

---

### 2. Frontend Data Models
Đồng bộ mô hình dữ liệu phía Frontend.

#### [MODIFY] `frontend/src/types/game.ts`
- Thêm thuộc tính `system?: string;` mặc định vào interface `Game`.

---

### 3. Service Lõi Giả Lập (`emulatorService`)
Nâng cấp logic tải game để chạy đúng Core libretro tương ứng với hệ máy thay vì 1 core cố định.

#### [MODIFY] `frontend/src/services/emulatorService.ts`
- Sửa cấu hình Keybindings bằng cách mở rộng 4 nút bấm nữa là `X, Y, L, R` vào các model (`PlayerKeys`, `GamepadButtonMap`).
- Sửa hàm `loadGame` để lấy thuộc tính `system` từ biến `game`.
- Thay vì gọi tĩnh `Nostalgist.nes({ ... })`, chúng ta sẽ sử dụng cú pháp map động cho từng core.

---

### 4. UI Components

#### [MODIFY] Giao Diện Admin & Upload (Admin CMS)
- Ở trang sửa thông tin Game hoặc upload.

#### [MODIFY] Tùy chỉnh Nút bấm Settings cho User (`User Settings`)
- File `KeybindingSelector.tsx` và `GamepadSelector.tsx`:
  - Thêm Form Input cho User có thể map (Gắn nút) cho phím X, Y và cò L, cò R.

#### [MODIFY] Điều khiển ảo trên Điện thoại (`MobileControlsOverlay.tsx`)
- Làm động lại cái TouchPad (Gamepad ảo) trên điện thoại hỗ trợ 4 đến 6 nút.
