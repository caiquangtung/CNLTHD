-- Event Booking System Database Initialization
-- This file will be executed when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('active', 'expired', 'converted', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created when tables are created, but we can prepare the functions

-- ============================================================
-- SEED DATA
-- Chạy tự động sau khi NestJS đã tạo tables (có kiểm tra tồn tại)
-- Mật khẩu mẫu:
--   admin@eventbooking.com  → Admin1234
--   các user còn lại        → User1234
-- ============================================================

-- ------------------------------------------------------------
-- USERS (1 admin + 3 user thường)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    INSERT INTO users (id, email, password_hash, full_name, "profileData", role, created_at, updated_at)
    VALUES
      (
        'a0000000-0000-0000-0000-000000000001',
        'admin@eventbooking.com',
        crypt('Admin1234', gen_salt('bf', 10)),
        'Quản Trị Viên Hệ Thống',
        '{"phone": "0901234567", "address": "Hà Nội, Việt Nam"}',
        'admin',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '60 days'
      ),
      (
        'a0000000-0000-0000-0000-000000000002',
        'nguyen.thi.lan@gmail.com',
        crypt('User1234', gen_salt('bf', 10)),
        'Nguyễn Thị Lan',
        '{"phone": "0912345678", "address": "Hà Nội, Việt Nam", "dob": "1998-05-20"}',
        'user',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '30 days'
      ),
      (
        'a0000000-0000-0000-0000-000000000003',
        'tran.van.minh@gmail.com',
        crypt('User1234', gen_salt('bf', 10)),
        'Trần Văn Minh',
        '{"phone": "0987654321", "address": "TP. Hồ Chí Minh, Việt Nam", "dob": "1995-11-10"}',
        'user',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '25 days'
      ),
      (
        'a0000000-0000-0000-0000-000000000004',
        'pham.thi.hoa@gmail.com',
        crypt('User1234', gen_salt('bf', 10)),
        'Phạm Thị Hoa',
        '{"phone": "0978123456", "address": "Đà Nẵng, Việt Nam", "dob": "2000-03-15"}',
        'user',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
      ),
      (
        'a0000000-0000-0000-0000-000000000005',
        'le.van.organizer@gmail.com',
        crypt('Org1234', gen_salt('bf', 10)),
        'Lê Văn Tổ Chức',
        '{"phone": "0933111222", "address": "Hà Nội, Việt Nam", "company": "EventPro Vietnam"}',
        'organizer',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '20 days'
      )
    ON CONFLICT (email) DO NOTHING;

    RAISE NOTICE 'Seeded: users (5 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table users does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- EVENTS (2 published + 1 draft + 1 cancelled)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    INSERT INTO events (id, slug, name, description, location, start_time, end_time, status, organizer_id, created_at, updated_at)
    VALUES
      (
        'e0000000-0000-0000-0000-000000000001',
        'tech-summit-vietnam-2026',
        'Tech Summit Vietnam 2026',
        'Sự kiện công nghệ lớn nhất năm 2026 quy tụ hàng trăm chuyên gia, kỹ sư và nhà khởi nghiệp hàng đầu Việt Nam. Chủ đề: AI, Cloud Computing, Web3 và tương lai số.',
        'Trung tâm Hội nghị Quốc gia, 57 Phạm Hùng, Hà Nội',
        NOW() + INTERVAL '90 days',
        NOW() + INTERVAL '91 days',
        'published',
        'a0000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '5 days'
      ),
      (
        'e0000000-0000-0000-0000-000000000002',
        'le-hoi-am-nhac-mua-he-2026',
        'Lễ Hội Âm Nhạc Mùa Hè 2026',
        'Đêm nhạc ngoài trời hoành tráng với sự góp mặt của hơn 20 nghệ sĩ nổi tiếng. Không gian xanh, âm nhạc sống động, ẩm thực phong phú — trải nghiệm không thể bỏ lỡ của mùa hè!',
        'Công viên Yên Sở, Hoàng Mai, Hà Nội',
        NOW() + INTERVAL '120 days',
        NOW() + INTERVAL '120 days' + INTERVAL '8 hours',
        'published',
        'a0000000-0000-0000-0000-000000000002',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '3 days'
      ),
      (
        'e0000000-0000-0000-0000-000000000003',
        'workshop-nestjs-advanced-2026',
        'Workshop NestJS Advanced 2026',
        'Workshop thực hành chuyên sâu về NestJS: kiến trúc microservices, tích hợp Redis, message queue với RabbitMQ, và CI/CD pipeline. Giới hạn 40 học viên, đảm bảo chất lượng thực hành.',
        'FPT Polytechnic Hà Nội, Trịnh Văn Bô, Nam Từ Liêm',
        NOW() + INTERVAL '45 days',
        NOW() + INTERVAL '45 days' + INTERVAL '6 hours',
        'draft',
        'a0000000-0000-0000-0000-000000000005',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day'
      ),
      (
        'e0000000-0000-0000-0000-000000000004',
        'hoi-thao-ai-ml-q1-2026',
        'Hội Thảo AI & Machine Learning Q1/2026',
        'Hội thảo khoa học về ứng dụng Trí tuệ nhân tạo và Machine Learning trong doanh nghiệp. Rất tiếc sự kiện đã bị hủy do lý do kỹ thuật.',
        'Đại học Bách Khoa Hà Nội, Hai Bà Trưng',
        NOW() + INTERVAL '20 days',
        NOW() + INTERVAL '20 days' + INTERVAL '4 hours',
        'cancelled',
        'a0000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '40 days',
        NOW() - INTERVAL '2 days'
      )
    ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE 'Seeded: events (4 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table events does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- TICKET TYPES (2-3 loại vé cho mỗi event)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ticket_types'
  ) THEN
    INSERT INTO ticket_types (id, event_id, name, description, price, quantity, max_per_order, created_at, updated_at)
    VALUES
      -- Tech Summit Vietnam 2026
      (
        'c0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000001',
        'Vé Tiêu Chuẩn',
        'Vé vào cổng, tham dự toàn bộ phiên hội thảo chính, bao gồm tea break buổi sáng và chiều.',
        500000, 800, 5,
        NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'
      ),
      (
        'c0000000-0000-0000-0000-000000000002',
        'e0000000-0000-0000-0000-000000000001',
        'Vé VIP',
        'Bao gồm tất cả quyền lợi Tiêu Chuẩn + bữa trưa buffet, chỗ ngồi hàng đầu, networking session riêng với diễn giả và quà tặng đặc biệt.',
        1500000, 150, 3,
        NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'
      ),
      (
        'c0000000-0000-0000-0000-000000000003',
        'e0000000-0000-0000-0000-000000000001',
        'Vé Premium',
        'Gói cao cấp nhất: tất cả VIP + bữa tối gala dinner, 1-on-1 session với speaker, tên khắc trên bảng tài trợ và certificate tham dự có chữ ký.',
        3000000, 30, 2,
        NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'
      ),
      -- Lễ Hội Âm Nhạc Mùa Hè 2026
      (
        'c0000000-0000-0000-0000-000000000004',
        'e0000000-0000-0000-0000-000000000002',
        'Vé Thường',
        'Vé vào cửa khu vực chung, đứng tự do thưởng thức các màn trình diễn.',
        299000, 2000, 8,
        NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'
      ),
      (
        'c0000000-0000-0000-0000-000000000005',
        'e0000000-0000-0000-0000-000000000002',
        'Vé VIP Khu Vực Đặc Biệt',
        'Khu vực khán đài gần sân khấu, chỗ ngồi có đánh số, bao gồm 1 combo nước + snack và vòng đeo tay lưu niệm.',
        799000, 300, 4,
        NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'
      ),
      -- Workshop NestJS Advanced 2026 (draft)
      (
        'c0000000-0000-0000-0000-000000000006',
        'e0000000-0000-0000-0000-000000000003',
        'Vé Early Bird',
        'Giá ưu đãi cho 20 đăng ký đầu tiên. Bao gồm tài liệu học tập, bữa trưa và chứng nhận hoàn thành.',
        350000, 20, 1,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
      ),
      (
        'c0000000-0000-0000-0000-000000000007',
        'e0000000-0000-0000-0000-000000000003',
        'Vé Tiêu Chuẩn',
        'Tham gia đầy đủ workshop 6 tiếng, tài liệu học tập, bữa trưa và chứng nhận hoàn thành.',
        450000, 20, 1,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
      ),
      -- Hội Thảo AI & ML (cancelled event)
      (
        'c0000000-0000-0000-0000-000000000008',
        'e0000000-0000-0000-0000-000000000004',
        'Vé Tham Dự',
        'Vé tham dự hội thảo khoa học (sự kiện đã bị hủy).',
        200000, 200, 3,
        NOW() - INTERVAL '35 days', NOW() - INTERVAL '2 days'
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded: ticket_types (8 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table ticket_types does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- ORDERS (3 đơn hàng)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    INSERT INTO orders (id, user_id, total_amount, status, created_at, updated_at)
    VALUES
      (
        'd0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002',
        1000000,
        'paid',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
      ),
      (
        'd0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000003',
        1500000,
        'paid',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
      ),
      (
        'd0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000004',
        598000,
        'pending',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded: orders (3 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table orders does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'order_items'
  ) THEN
    INSERT INTO order_items (id, order_id, ticket_type_id, quantity, unit_price, created_at, updated_at)
    VALUES
      -- Order 1: Nguyễn Thị Lan mua 2 vé Tiêu Chuẩn Tech Summit
      (
        'f0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        2, 500000,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
      ),
      -- Order 2: Trần Văn Minh mua 1 vé VIP Tech Summit
      (
        'f0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000002',
        1, 1500000,
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
      ),
      -- Order 3: Phạm Thị Hoa mua 2 vé Thường Lễ Hội Âm Nhạc
      (
        'f0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000003',
        'c0000000-0000-0000-0000-000000000004',
        2, 299000,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded: order_items (3 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table order_items does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- PAYMENTS (2 thanh toán thành công cho order 1 và 2)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    INSERT INTO payments (id, order_id, amount, payment_method, status, transaction_id, payment_time, created_at, updated_at)
    VALUES
      (
        'b0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        1000000,
        'e_wallet',
        'success',
        'TXN-2026-LAN-001',
        NOW() - INTERVAL '10 days' + INTERVAL '5 minutes',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
      ),
      (
        'b0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000002',
        1500000,
        'credit_card',
        'success',
        'TXN-2026-MINH-001',
        NOW() - INTERVAL '7 days' + INTERVAL '3 minutes',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
      )
    ON CONFLICT (order_id) DO NOTHING;

    RAISE NOTICE 'Seeded: payments (2 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table payments does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- TICKETS (vé điện tử cho các đơn đã thanh toán)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tickets'
  ) THEN
    INSERT INTO tickets (id, order_id, ticket_type_id, ticket_code, qr_data, status, created_at, updated_at)
    VALUES
      -- 2 vé cho Order 1 (Nguyễn Thị Lan - Tiêu Chuẩn Tech Summit)
      (
        '10000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'TECH2026-STD-000001',
        '{"ticketId":"10000000-0000-0000-0000-000000000001","event":"Tech Summit Vietnam 2026","type":"Tiêu Chuẩn","holder":"Nguyễn Thị Lan","code":"TECH2026-STD-000001"}',
        'active',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
      ),
      (
        '10000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'TECH2026-STD-000002',
        '{"ticketId":"10000000-0000-0000-0000-000000000002","event":"Tech Summit Vietnam 2026","type":"Tiêu Chuẩn","holder":"Nguyễn Thị Lan","code":"TECH2026-STD-000002"}',
        'active',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
      ),
      -- 1 vé cho Order 2 (Trần Văn Minh - VIP Tech Summit)
      (
        '10000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000002',
        'TECH2026-VIP-000001',
        '{"ticketId":"10000000-0000-0000-0000-000000000003","event":"Tech Summit Vietnam 2026","type":"VIP","holder":"Trần Văn Minh","code":"TECH2026-VIP-000001"}',
        'active',
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
      )
    ON CONFLICT (ticket_code) DO NOTHING;

    RAISE NOTICE 'Seeded: tickets (3 rows)';
  ELSE
    RAISE NOTICE 'SKIP: table tickets does not exist yet';
  END IF;
END $$;

-- ------------------------------------------------------------
-- ORDER RESERVATIONS (Phạm Thị Hoa đang giữ chỗ — chưa thanh toán)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'order_reservations'
  ) THEN
    INSERT INTO order_reservations (id, user_id, ticket_type_id, quantity, unit_price, expires_at, status, created_at, updated_at)
    VALUES
      (
        '20000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000004',
        2, 299000,
        NOW() + INTERVAL '10 minutes',
        'active',
        NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded: order_reservations (1 row)';
  ELSE
    RAISE NOTICE 'SKIP: table order_reservations does not exist yet';
  END IF;
END $$;

-- ============================================================
-- SUMMARY
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA SUMMARY:';
  RAISE NOTICE '  users             : 5 (1 admin + 1 organizer + 3 users)';
  RAISE NOTICE '  events            : 4 (2 published, 1 draft, 1 cancelled)';
  RAISE NOTICE '  ticket_types      : 8 (2-3 per event)';
  RAISE NOTICE '  orders            : 3 (2 paid, 1 pending)';
  RAISE NOTICE '  order_items       : 3';
  RAISE NOTICE '  payments          : 2 (success)';
  RAISE NOTICE '  tickets           : 3 (active)';
  RAISE NOTICE '  order_reservations: 1 (active)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Passwords:';
  RAISE NOTICE '  admin@eventbooking.com      → Admin1234 (role: admin)';
  RAISE NOTICE '  le.van.organizer@gmail.com  → Org1234   (role: organizer)';
  RAISE NOTICE '  nguyen.thi.lan@gmail.com    → User1234  (role: user)';
  RAISE NOTICE '  tran.van.minh@gmail.com     → User1234  (role: user)';
  RAISE NOTICE '  pham.thi.hoa@gmail.com      → User1234  (role: user)';
  RAISE NOTICE '========================================';
END $$;