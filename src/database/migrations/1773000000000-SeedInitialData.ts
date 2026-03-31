import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1773000000000 implements MigrationInterface {
  name = 'SeedInitialData1773000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── USERS (1 admin + 1 organizer + 3 users) ──
    await queryRunner.query(`
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
      ON CONFLICT (email) DO NOTHING
    `);

    // ── EVENTS (2 published + 1 draft + 1 cancelled) ──
    await queryRunner.query(`
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
          (SELECT id FROM users WHERE email = 'admin@eventbooking.com' LIMIT 1),
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
          (SELECT id FROM users WHERE email = 'nguyen.thi.lan@gmail.com' LIMIT 1),
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
          (SELECT id FROM users WHERE email = 'le.van.organizer@gmail.com' LIMIT 1),
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
          (SELECT id FROM users WHERE email = 'admin@eventbooking.com' LIMIT 1),
          NOW() - INTERVAL '40 days',
          NOW() - INTERVAL '2 days'
        )
      ON CONFLICT (slug) DO NOTHING
    `);

    // ── TICKET TYPES (2-3 loại vé cho mỗi event) ──
    await queryRunner.query(`
      INSERT INTO ticket_types (id, event_id, name, description, price, quantity, max_per_order, created_at, updated_at)
      VALUES
        ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
         'Vé Tiêu Chuẩn',
         'Vé vào cổng, tham dự toàn bộ phiên hội thảo chính, bao gồm tea break buổi sáng và chiều.',
         500000, 800, 5, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

        ('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
         'Vé VIP',
         'Bao gồm tất cả quyền lợi Tiêu Chuẩn + bữa trưa buffet, chỗ ngồi hàng đầu, networking session riêng với diễn giả và quà tặng đặc biệt.',
         1500000, 150, 3, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

        ('c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001',
         'Vé Premium',
         'Gói cao cấp nhất: tất cả VIP + bữa tối gala dinner, 1-on-1 session với speaker, tên khắc trên bảng tài trợ và certificate tham dự có chữ ký.',
         3000000, 30, 2, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

        ('c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002',
         'Vé Thường',
         'Vé vào cửa khu vực chung, đứng tự do thưởng thức các màn trình diễn.',
         299000, 2000, 8, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

        ('c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002',
         'Vé VIP Khu Vực Đặc Biệt',
         'Khu vực khán đài gần sân khấu, chỗ ngồi có đánh số, bao gồm 1 combo nước + snack và vòng đeo tay lưu niệm.',
         799000, 300, 4, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

        ('c0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003',
         'Vé Early Bird',
         'Giá ưu đãi cho 20 đăng ký đầu tiên. Bao gồm tài liệu học tập, bữa trưa và chứng nhận hoàn thành.',
         350000, 20, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

        ('c0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003',
         'Vé Tiêu Chuẩn',
         'Tham gia đầy đủ workshop 6 tiếng, tài liệu học tập, bữa trưa và chứng nhận hoàn thành.',
         450000, 20, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

        ('c0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004',
         'Vé Tham Dự',
         'Vé tham dự hội thảo khoa học (sự kiện đã bị hủy).',
         200000, 200, 3, NOW() - INTERVAL '35 days', NOW() - INTERVAL '2 days')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM ticket_types WHERE id IN ('c0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000008')`,
    );
    await queryRunner.query(
      `DELETE FROM events WHERE id IN ('e0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000004')`,
    );
    await queryRunner.query(
      `DELETE FROM users WHERE id IN ('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000005')`,
    );
  }
}
