# Hệ thống Gọi món bằng mã QR (Goimon QR System)

Dự án này là một ứng dụng gọi món ăn tại bàn thông qua mã QR, bao gồm phần giao diện dành cho khách hàng (Frontend) và hệ thống quản lý/xử lý đơn hàng (Backend).

## 🚀 Công nghệ sử dụng
- **Frontend**: React.js, Vite, Tailwind CSS, React Router DOM.
- **Backend**: Node.js, Express.js.
- **Database**: Firebase Firestore.
- **Authentication**: Firebase Admin SDK.

## 📂 Cấu trúc thư mục
- `/` (Root): Chứa mã nguồn Frontend (React + Vite).
- `/backend`: Chứa mã nguồn Backend (Node + Express).

## 🛠 Hướng dẫn Cài đặt & Chạy dự án (Local)

### 1. Yêu cầu hệ thống
- Node.js (Khuyến nghị phiên bản v18 trở lên).
- Project trên Firebase (có sử dụng Firestore Database).

### 2. Cấu hình & Chạy Backend (Máy chủ xử lý)

1. Mở terminal và di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình Database:
   - Hãy copy file `serviceAccountKey.json` (do chủ dự án cung cấp) và dán nó vào thư mục `backend/` của dự án này.
4. Khởi động Backend server:
   ```bash
   node server.js
   ```
   *Nếu thành công, console sẽ báo "Firebase Admin initialized successfully" và "Server is running on port 3001".*

### 3. Cấu hình & Chạy Frontend (Giao diện Web)

1. Mở một terminal mới (để giữ cho backend vẫn tiếp tục chạy) và đảm bảo bạn đang ở **thư mục gốc** của dự án (nằm ngoài thư mục backend).
2. Cài đặt các gói thư viện phụ thuộc cho React:
   ```bash
   npm install
   ```
3. Khởi động môi trường phát triển (Vite server):
   ```bash
   npm run dev
   ```
4. Truy cập vào ứng dụng thông qua đường dẫn hiện trên terminal (Thường là `http://localhost:5173`).

## 🌟 Chức năng chính
- **Dành cho Khách hàng**: Quét mã QR tại bàn, xem thực đơn (các món nổi bật, phân loại), thêm vào giỏ hàng, tùy chỉnh số lượng, ghi chú, đặt món, gọi nhân viên, và yêu cầu tính tiền. Trải nghiệm mượt mà được tối ưu 100% trên thiết bị di động (Mobile-first).
- **Dành cho Admin/Nhân viên**: Quản lý danh mục, món ăn, quản lý mã QR bàn, nhận đơn hàng theo thời gian thực (Realtime) và theo dõi trạng thái món ăn.

## 🔐 Tài khoản Truy cập Mặc định
Sau khi khởi chạy thành công cả Backend và Frontend, bạn có thể truy cập vào trang Quản trị (Admin) bằng tài khoản mặc định sau:
- **Tên nhân viên**: `Admin`
- **Mật khẩu**: `123456`
