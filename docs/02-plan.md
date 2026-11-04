# Kế hoạch site

Trạng thái: chờ Demi duyệt. Dựa trên `docs/01-brief.md`.

Mục tiêu: creative director ở agency nước ngoài xem tay nghề của Demi trong 30 giây đầu, hiểu Demi làm phần nào, và liên hệ được ngay.

## Sitemap

| Trang | Đường dẫn | Việc của trang |
|---|---|---|
| Work | `/` | Hero showreel và danh sách video, là trang chính |
| Dự án | `/work/[slug]` | Xem video tràn màn hình, vai trò, bối cảnh, video kế tiếp |
| Playground | `/playground` | Side project của Demi, thêm mới bằng cách sửa file dữ liệu |
| About | `/about` | Giới thiệu, chân dung, kỹ năng, tải CV |

Contact là phần cuối của mọi trang, không tách trang riêng. Không làm trang đích riêng, vì người xem cần thấy tác phẩm ngay.

**Thanh menu:** cố định ở đầu mọi trang, luôn nhìn thấy khi cuộn. Tên Demi Phan bên trái, bên phải là `■ WORK`, `■ PLAYGROUND`, `■ ABOUT` và nút nổi bật `CONTACT`. Nút này nền đỏ đặc `#FF343B`, chữ đen `#101010` (tương phản khoảng 5:1, chữ trắng chỉ khoảng 3,6:1), không đảo màu theo nền, bấm vào cuộn tới phần Contact. Trên điện thoại nút vẫn hiện cạnh `■ MENU`. Mục đang xem được đánh dấu đỏ. Chữ tự đảo màu để đọc được trên cả nền sáng và trên video. Trên điện thoại rút gọn thành `■ MENU`, chạm để mở.

## Trang Work

1. **Hero:** dựng theo mục "Hero theo noartmusic.com" bên dưới.
2. **Danh sách video:** nút chuyển Gallery và Full-Screen. Mỗi thẻ có video xem trước, tên, loại video, năm, vai trò.
3. **Case study:** một thẻ nổi bật dẫn tới Marketing Arena 2026.
4. **Contact:** email lớn, LinkedIn, múi giờ, tải CV.

## Hero theo noartmusic.com

Demi chọn [noartmusic.com](https://www.noartmusic.com/) làm reference sát cho hero. Làm giống bố cục và hiệu ứng, thay toàn bộ nội dung bằng của Demi. Không dùng logo, footage và câu chữ của No Art.

| Thành phần | Ở No Art | Bản của Demi |
|---|---|---|
| Nền | Video tràn màn hình, cao đúng một màn hình, cắt nhanh, có nhịp đen và nhịp màu | Vòng lặp 15 đến 20 giây dựng từ video của Demi, tránh giây 40 đến 56 của showreel |
| Chính giữa | Logo viết tay, chữ đảo màu theo video (`mix-blend-mode: difference`) | Chữ ký "Demi Phan" cùng hiệu ứng |
| Khung ngắm | 4 góc vuông nhỏ quanh logo, thêm dấu ở mép màn hình | Giữ nguyên, hợp với ý tưởng khung ngắm phòng dựng |
| Trái dưới | Nhãn mono có ô vuông nhỏ và mô tả ngắn | `■ VIDEO EDITOR`, câu giới thiệu "I turn messages into rhythm, then use VFX and motion to push how far video can carry them.", "open to remote internships" |
| Phải dưới | Thẻ thumbnail "Next up" | Thẻ thumbnail `PLAY SHOWREEL 01:29`, mở bản đầy đủ có tiếng |
| Menu | Chữ mono nhỏ có ô vuông, hai hàng; mobile là nút `■ MENU` | Dùng kiểu này cho toàn site, thay kiểu ngoặc vuông |

Khi cuộn, hero trôi lên như bình thường, không bị ghim, phần nền trắng hiện ra ngay. Không có màn hình loading chặn, video hiện ngay trên poster. Bản reduced-motion dừng video ở poster.

Font thêm Chivo Mono (miễn phí) cho nhãn và menu, cùng họ font với reference.

## Danh sách tác phẩm đề xuất

| # | Tác phẩm | File | Vai trò | Ghi chú |
|---|---|---|---|---|
| 1 | Gala Night film | `Video editor/gala-night...mp4` | Video Editor | Mở đầu danh sách |
| 2 | Time Pressure teaser | `Video editor/quy-thoi-gian...mp4` | Video Editor | Tên tiếng Anh tạm, cần Demi duyệt |
| 3 | First Event 2025 "Spycom" | `first-event-2025...mp4` | Filmer & Video Editor | Demi xác nhận |
| 4 | Top 4 announcement | `Vfx_motion/chinh-thuc...mp4` | Video Editor | |
| 5 | Nguyen Hue OOH | `Vfx_motion/ma26-ooh...mp4` | Video Editor | Video dọc |
| 6 | Countdown 72H | `Vfx_motion/cd-end-2.mp4` | Motion | Video dọc |
| 7 | Ngoc Ho Medicare | [Thiếu file] | Video Editor, remote | Ẩn cho tới khi có file và được phép đăng |

Mỗi thẻ có nhãn kỹ năng `Editing`, `VFX`, `Motion` để người xem thấy bằng chứng cho từng kỹ năng. Tên video ở trên là tên làm việc. Video ghép footage phim hiển thị ghi chú nguồn footage và không xếp đầu.

## Case study Marketing Arena 2026

Bối cảnh, vai trò, các video, KV và post, kết quả. Số liệu lấy nguyên từ CV: 3.087 người tham gia, 1.029 đội, 80 trường, 2,4M view, 37K+ tương tác, 14,2K click, 7K+ session.

Phần việc ghi rõ: toàn bộ video do Demi làm; Demi thiết kế và quản lý `marketingarena.vn`; post gồm phần tự làm và phần chỉ đạo. Ẩn 4 post có ảnh thí sinh.

## Playground

Lưới so le, nhẹ và tự do hơn trang Work. Mỗi mục có tên, năm, một dòng mô tả và ảnh hoặc video; có thể dẫn ra link ngoài. Dữ liệu nằm trong `content/playground.ts`, thêm side project không cần sửa giao diện. Trang để trống phần chưa có, không dùng nội dung giả.

## About

Chân dung `Portrait.png` trên nền đen, đoạn giới thiệu ngắn, công cụ (Premiere Pro, After Effects, Photoshop), kinh nghiệm chính, giải thưởng, IELTS 7.0, nút tải CV. Câu "open to remote internships" đặt ở vị trí dễ thấy.

Nội dung chỉ lấy từ CV. Bản tiếng Anh sẽ được Claude viết và Demi duyệt ở bước design.

## Stack

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | Next.js, TypeScript | Route động cho dự án, tối ưu ảnh, `CLAUDE.md` đã nhắc tới |
| Style | Tailwind CSS | Extension đã cài, token dễ chia sẻ với Sixth |
| Motion | GSAP, ScrollTrigger, Lenis | Cùng công cụ với reference chính, đã có skill GSAP |
| Nội dung | File dữ liệu `content/projects.ts` | Thêm dự án không cần sửa giao diện |
| Font | Inter Tight | Miễn phí, gần Neue Haas Grotesk |
| Deploy | Vercel | Miễn phí, hợp với Next.js. Đăng public cần Demi duyệt |

Không dùng WebGL ở bản đầu. Chỉ thêm nếu hiệu ứng tách màu bằng CSS không đủ đẹp.

## Xử lý video

- Showreel đầy đủ: H.264 1080p, mục tiêu dưới 40 MB, từ file 336 MB.
- Video xem trước: 6 đến 8 giây, không tiếng, 720p, dưới 3 MB mỗi file, kèm poster tĩnh.
- Chỉ tải video trong màn hình đang xem. Trên mobile hoặc mạng yếu dùng poster, chạm để phát.
- Reduced-motion: dừng video tự chạy và hiện poster.
- Video tự host, không dùng YouTube. Nếu dung lượng vượt giới hạn Vercel thì chuyển sang Cloudflare R2.

## Việc Demi cần cung cấp

- Mẫu video Ngoc Ho Medicare và xác nhận được đăng
- Danh sách post và KV tự làm, phần còn lại ghi là director
- Side project cho Playground: tên, năm, mô tả ngắn, file hoặc link
- Chữ ký "Demi Phan" dạng SVG hoặc PNG nền trong, cho hero
- Vòng lặp hero 15 đến 20 giây do Demi dựng. Nếu chưa có, Claude cắt bản nháp bằng `ffmpeg`
- Video nào là video ghép footage phim
- File CV tiếng Anh dùng để tải, đã đổi tên thành Demi Phan
- LinkedIn hiện có slug `trang-phan-aba4a8319`: giữ hay đổi?

Site vẫn dựng được khi thiếu các mục này, phần thiếu sẽ để placeholder rõ ràng.
