# Loading Screen - NestGame

## Giới Thiệu

Loading screen tự động hiển thị khi chuyển route giữa các pages trong NestGame. Được thiết kế với retro arcade theme phù hợp với tính chất của dự án.

---

## Kiến Trúc

### 1. LoadingProvider (`components/providers/LoadingProvider.tsx`)
- Lắng nghe sự kiện `routeChangeStart`, `routeChangeComplete`, `routeChangeError`
- Quản lý state `isLoading`
- Custom hook `useLoading()` để access loading state ở bất kỳ component nào

### 2. LoadingScreen (`components/LoadingScreen.tsx`)
- Hiển thị arcade-themed loading screen
- Animations: pixel grid fade, shimmer progress bar, neon glow
- Responsive design

### 3. Integration (`app/layout.tsx`)
- Wrap tất cả providers với `LoadingProvider`
- Render `<LoadingScreen />` bên trong `QueryProvider`

---

## Cách Hoạt Động

```
User clicks link
    ↓
routeChangeStart triggered
    ↓
LoadingProvider sets isLoading = true
    ↓
LoadingScreen renders (backdrop blur + arcade frame)
    ↓
Route load complete
    ↓
routeChangeComplete/Error triggered
    ↓
LoadingProvider sets isLoading = false
    ↓
LoadingScreen unmounts
```

---

## Tuỳ Chỉnh

### Thay Đổi Màu Sắc

Tìm các class có `cyan`, `purple`, `pink` trong `LoadingScreen.tsx`:

```tsx
// Neon cyan (hiện tại)
border-cyan-400
bg-gradient-to-r from-cyan-400 to-purple-600

// Để dùng màu khác:
border-emerald-400          // Emerald theme
bg-gradient-to-r from-emerald-400 to-teal-600

// Hoặc retro-orange
border-orange-400
bg-gradient-to-r from-orange-400 to-red-600
```

### Thay Đổi Thời Gian Animation

```tsx
// Hiện tại: 1.5s (pixel grid), 2s (progress bar)
style={{
  animation: `fadeIn 1.5s ease-in-out infinite`,  // ← Đổi số này
}}

// Progress bar
animate-shimmer  // Thêm vào @keyframes timing
```

### Thay Đổi Text

```tsx
// "Loading your next adventure..."
<p className="...">Đang tải game yêu thích của bạn...</p>

// "ARCADE MODE"
<p className="...">▮ ▮ RETRO MODE ▮ ▮</p>
```

### Thay Đổi Size

```tsx
w-80  // Chiều rộng (đổi thành w-96, w-72)
p-8   // Padding bên trong (đổi thành p-6, p-10)
grid-cols-6  // Số cột pixel grid (đổi thành grid-cols-4, grid-cols-8)
```

---

## Variant cấp cao hơn

Để tạo loading screen variant khác nhau cho các route khác nhau:

```tsx
// components/LoadingScreen.tsx
export function LoadingScreen() {
  const { isLoading } = useLoading();
  const router = useRouter();

  // Variant dựa trên route
  const variant = router.pathname.includes('/games/[id]') ? 'detail' : 'list';

  if (!variant === 'detail') {
    return <LoadingScreenDetail />;
  }

  return <LoadingScreenDefault />;
}
```

---

## Performance

- Loading screen render chỉ khi `isLoading = true`
- Sử dụng `backdrop-blur-sm` thay vì solid black (performance tốt hơn)
- Animations dùng `transform` và `opacity` (GPU-accelerated)

---

## Xử Lý Lỗi

Nếu loading screen không hiển thị:

1. **Kiểm tra LoadingProvider** - Có wrap quanh app không?
2. **Kiểm tra z-index** - `z-50` có bị override không?
3. **Kiểm tra router events** - Có kích hoạt `routeChangeStart` không?

```tsx
// Debug trong Terminal
// Bật trong DevTools Console
window.addEventListener('routeChangeStart', () => console.log('Route starting...'));
```

---

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (không support blur effect)

---

## Liên Quan

- `app/layout.tsx` - Main layout
- `.github/workflows/` - CI/CD (để deploy)
- `docs/DEPLOYMENT.md` - Deploy guide
