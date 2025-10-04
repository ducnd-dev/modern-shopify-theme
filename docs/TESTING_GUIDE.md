# Modern Shopify Theme - Testing & QA Guide

## 1. Performance Testing
- Sử dụng Lighthouse (Chrome DevTools) để kiểm tra:
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
  - Speed Index
- Kiểm tra lazy loading, critical CSS, code splitting

## 2. Accessibility Testing
- Sử dụng axe DevTools hoặc Lighthouse để kiểm tra:
  - Contrast ratio
  - Keyboard navigation
  - ARIA labels
  - Skip to content links
- Kiểm tra các thành phần: header, cart, quick view, search

## 3. Responsive Testing
- Kiểm tra trên các thiết bị:
  - Mobile (iPhone, Android)
  - Tablet
  - Desktop
- Sử dụng Chrome DevTools Device Mode

## 4. Cross-Browser Testing
- Kiểm tra trên các trình duyệt:
  - Chrome
  - Firefox
  - Safari
  - Edge
- Kiểm tra layout, animation, JS features

## 5. Feature Testing Checklist
- [ ] Demo content tự động hiển thị đúng
- [ ] Social proof notifications hoạt động
- [ ] Cart drawer và add-to-cart hoạt động
- [ ] Predictive search hiển thị kết quả
- [ ] Testimonials và reviews hiển thị đúng
- [ ] Theme settings thay đổi giao diện
- [ ] Service worker/PWA hoạt động

## 6. Automated Performance Script
Chạy script sau để kiểm tra performance:

```bash
npx lighthouse https://localhost --view
```

Hoặc dùng Chrome DevTools > Lighthouse.

## 7. Accessibility Script
Chạy axe-core trên Chrome DevTools hoặc dùng extension:
- https://www.deque.com/axe/devtools/

## 8. Responsive & Cross-Browser
- Sử dụng BrowserStack hoặc thiết bị thật để kiểm tra.

## 9. Báo cáo lỗi
- Ghi lại lỗi vào file `docs/QA_REPORT.md`
- Đính kèm ảnh chụp màn hình, mô tả lỗi, bước tái hiện

---

**Lưu ý:**
- Luôn kiểm tra lại sau mỗi lần cập nhật theme
- Đảm bảo không có lỗi nghiêm trọng trước khi release
