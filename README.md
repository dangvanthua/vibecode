# 🌹 Khu Vườn Hoa Hồng 20/10 — Tiệm Quà Hạnh Phúc (Chọn 3 Món Đồ)

Trang web chúc mừng **Ngày Phụ Nữ Việt Nam 20/10** được thiết kế tối ưu cho điện thoại (Mobile-First), mang tông hồng pastel - ruby lãng mạn, hiệu ứng cánh hoa hồng rơi 60fps, giai điệu hộp nhạc (Web Audio API) và xuất **Vé Đổi Quà Hoa Hồng VIP (PNG sắc nét)**.

---

## ✨ Tính năng nổi bật

1. **Màn hình 1 — Phong Bì Sáp Hoa Hồng & Đóa Hồng Nở Rộ**:
   - Bông hoa hồng vector nghệ thuật chuyển động nở cánh mềm mại.
   - Chạm vào con dấu sáp hoa hồng để bung mưa cánh hồng, phát giai điệu hộp nhạc lãng mạn và mở bức thư chúc mừng 20/10.
2. **Màn hình 2 — Tiệm Quà Hoa Hồng (Cho phép chọn đúng 3 món đồ)**:
   - Bộ 12 món đồ / đặc quyền gợi ý cực kỳ tâm lý (Hoa hồng, Son môi, Bữa tối hẹn hò, Trà sữa, Váy xinh, Xem phim, Lì xì chuyển khoản, 1 Ngày làm Nữ Hoàng, Chụp 100 tấm ảnh, Massage, Gấu bông/Blindbox, và **Điều Ước Tự Chọn**).
   - Có bộ lọc danh mục & nút **🎲 Chọn ngẫu nhiên giúp em**.
   - Thanh **Giỏ Hoa Hồng Ước Nguyện** cố định dưới đáy màn hình điện thoại (hiển thị trực quan 3 ô món quà đã chọn).
3. **Màn hình 3 — Vé Đổi Quà Hoa Hồng VIP 20/10**:
   - Xuất tấm vé đổi quà sang trọng kèm con dấu **"ĐÃ XÁC NHẬN YÊU THƯƠNG 20/10"** và ô nhập lời nhắn của người nhận.
   - **📸 Tải Ảnh Vé Đổi Quà (PNG 1080×1520 sắc nét)** hoặc **📲 Chia sẻ trực tiếp** qua Zalo / Messenger / AirDrop trên iPhone & Android.
4. **✨ Tùy chỉnh & Tạo Link Gửi Tặng ngay trên Web (Sau khi đã Deploy Vercel)**:
   - Bấm nút **✨ Tùy chỉnh** ở góc trên bên phải để đổi Tên người nhận, Tên người gửi, Lời chúc và sửa/thêm bất kỳ món đồ nào.
   - Bấm **🔗 Copy Link Gửi Tặng**: Hệ thống tự động mã hóa toàn bộ nội dung vào đường link URL và **tự động ẩn nút Tùy chỉnh** khi người nhận mở link!

---

## 🚀 Cách Deploy lên Vercel (Chỉ mất 30 giây)

Dự án được xây dựng hoàn toàn tĩnh (Zero-build dependency), tương thích 100% với Vercel:

### Cách 1: Kéo thả hoặc Import từ GitHub lên Vercel
1. Đẩy thư mục này lên GitHub repository của bạn.
2. Vào [vercel.com/new](https://vercel.com/new) -> Chọn repository -> Bấm **Deploy** (không cần chỉnh sửa Build Command hay Output Directory).

### Cách 2: Dùng Vercel CLI
```bash
npx vercel --prod
```

---

## 🛠️ Chỉnh sửa danh sách quà mặc định trong Code

Mở file [`gifts-config.js`](./gifts-config.js) để chỉnh sửa nhanh:
- `recipientName`: Tên người nhận mặc định
- `senderName`: Tên người gửi mặc định
- `letterGreeting` & `letterBody`: Nội dung bức thư 20/10
- `gifts`: Mảng danh sách các món đồ (có thể đổi `icon`, `title`, `description`).
