# Restaurant Order System

Hệ thống đặt món ăn qua mã QR dành cho nhà hàng với 3 vai trò: Khách hàng, Thu ngân và Quản lý.

## Tính năng

### Khách hàng (Customer)
- Quét mã QR tại bàn để xem menu và đặt món
- Xem hình ảnh, mô tả và giá món ăn
- Thêm ghi chú cho từng món (ít cay, không hành...)
- Xem tổng tiền đơn hàng
- Xem lại lịch sử món đã đặt trong phiên

### Thu ngân (Cashier)
- Nhận đơn hàng real-time từ các bàn
- Theo dõi trạng thái đơn hàng: Mới → Đang làm → Sẵn sàng → Hoàn thành
- Xem tổng quan các bàn đang có đơn
- Dọn bàn (tạo session mới cho khách tiếp theo)

### Quản lý (Admin)
- Xem tổng doanh thu và biểu đồ thống kê
- Quản lý menu: thêm, sửa, xóa món ăn
- Quản lý nhiều hình ảnh cho mỗi món
- Đặt trạng thái món: Đang bán / Ngưng bán
- Quản lý bàn và tạo mã QR
- Xem lịch sử đơn hàng

## Cài đặt

### Yêu cầu
- Node.js 18+
- pnpm (hoặc npm/yarn)
- Tài khoản Supabase (miễn phí)
- Vercel Blob storage (để upload hình ảnh)

### Bước 1: Clone và cài đặt dependencies

```bash
# Clone hoặc giải nén project
cd restaurant-order-system

# Cài đặt dependencies
pnpm install

# Cài đặt thêm @vercel/blob cho tính năng upload ảnh
pnpm add @vercel/blob
```

### Bước 2: Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com) và tạo tài khoản
2. Tạo project mới
3. Vào **Settings** → **API** để lấy:
   - Project URL
   - anon/public key

### Bước 3: Thiết lập Database

Vào **SQL Editor** trong Supabase Dashboard và chạy các script theo thứ tự:

1. **Tạo bảng** - Copy nội dung file `scripts/001-create-tables.sql` và chạy
2. **Seed dữ liệu mẫu** - Copy nội dung file `scripts/002-seed-data.sql` và chạy
3. **Thêm hỗ trợ nhiều hình ảnh** - Copy nội dung file `scripts/003-add-images-array.sql` và chạy
4. **Thêm quản lý session** - Copy nội dung file `scripts/004-add-session-token.sql` và chạy

### Bước 4: Cấu hình Environment Variables

```bash
# Copy file mẫu
cp .env.example .env.local

# Mở .env.local và điền thông tin
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Vercel Blob (để upload hình ảnh)
# Lấy token từ Vercel Dashboard -> Storage -> Create Blob Store
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

**Lưu ý về Vercel Blob:**
- Tính năng upload hình ảnh yêu cầu Vercel Blob storage
- Nếu chạy local mà chưa có Blob token, bạn vẫn có thể dùng URL hình ảnh từ bên ngoài
- Khi deploy lên Vercel, thêm Blob store trong phần Storage của project

### Bước 5: Chạy ứng dụng

```bash
pnpm dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

## Cấu trúc Database

### Bảng `categories` - Danh mục món ăn
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| name | text | Tên danh mục (VD: Phở, Cơm) |
| name_en | text | Tên tiếng Anh |
| sort_order | int | Thứ tự hiển thị |

### Bảng `menu_items` - Món ăn
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| category_id | uuid | FK đến categories |
| name | text | Tên món |
| name_en | text | Tên tiếng Anh |
| description | text | Mô tả |
| description_en | text | Mô tả tiếng Anh |
| price | int | Giá (VND) |
| image_url | text | Hình ảnh chính |
| images | text[] | Mảng các hình ảnh |
| is_available | boolean | Còn bán hay không |

### Bảng `tables` - Bàn
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| table_number | int | Số bàn |
| name | text | Tên bàn |
| capacity | int | Sức chứa |
| qr_code_token | text | Token cho QR code |
| session_token | text | Token phiên hiện tại |
| is_active | boolean | Bàn đang hoạt động |

### Bảng `orders` - Đơn hàng
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| table_id | uuid | FK đến tables |
| session_id | text | ID phiên đặt món |
| status | text | new/preparing/ready/done/cancelled |
| total_amount | int | Tổng tiền |
| notes | text | Ghi chú đơn hàng |

### Bảng `order_items` - Chi tiết đơn hàng
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| order_id | uuid | FK đến orders |
| menu_item_id | uuid | FK đến menu_items |
| quantity | int | Số lượng |
| unit_price | int | Đơn giá |
| notes | text | Ghi chú món |

## Hướng dẫn sử dụng

### Demo Mode
Khi chưa kết nối database, ứng dụng sẽ chạy ở chế độ Demo với dữ liệu mẫu.

### Tạo QR Code cho bàn
1. Đăng nhập Admin (`/admin`)
2. Vào tab "Quản Lý Bàn"
3. Tạo bàn mới hoặc click vào bàn có sẵn
4. Click "Tải QR Code" để tải hình QR
5. In và dán tại bàn

### Quy trình đặt món
1. Khách quét QR → Mở trang đặt món
2. Chọn món, thêm ghi chú, đặt hàng
3. Thu ngân nhận thông báo đơn mới
4. Thu ngân cập nhật trạng thái: Mới → Đang làm → Sẵn sàng → Hoàn thành
5. Khi khách thanh toán xong, Thu ngân click "Dọn bàn" để reset session

## Đa ngôn ngữ

Ứng dụng hỗ trợ 2 ngôn ngữ:
- Tiếng Việt (mặc định)
- Tiếng Anh

Click nút chuyển ngôn ngữ ở góc phải màn hình.

## Responsive Design

Ứng dụng được thiết kế responsive cho 3 loại màn hình:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## Công nghệ sử dụng

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State**: React Hooks + SWR

## Cấu trúc thư mục

```
├── app/
│   ├── page.tsx          # Trang chủ
│   ├── order/            # Trang đặt món (khách hàng)
│   ├── cashier/          # Trang thu ngân
│   └── admin/            # Trang quản lý
├── components/
│   ├── order/            # Components đặt món
│   ├── cashier/          # Components thu ngân
│   ├── admin/            # Components quản lý
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── supabase/         # Supabase client & types
│   └── i18n/             # Đa ngôn ngữ
├── scripts/              # SQL scripts
└── public/               # Static files
```

## Troubleshooting

### Lỗi "Supabase not configured"
- Kiểm tra file `.env.local` đã có đủ thông tin
- Restart dev server sau khi thay đổi env

### Không nhận được đơn real-time
- Kiểm tra Realtime đã được bật trong Supabase Dashboard
- Chạy lại script `001-create-tables.sql` để enable realtime cho bảng orders

### Lỗi RLS (Row Level Security)
- Các script đã bao gồm policies cần thiết
- Nếu vẫn lỗi, vào Supabase Dashboard → Authentication → Policies để kiểm tra

## License

MIT
# restaurant-management
