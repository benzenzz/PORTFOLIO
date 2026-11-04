# Kế hoạch site

Trạng thái: chờ Demi duyệt. Dựa trên `docs/01-brief.md` và file "Portfolio redesign — Stage 0 & Section 01" của Demi. File đó chỉ được dùng cho phần nội dung, chưa lấy định hướng thiết kế.

**Mục tiêu:** ứng tuyển Creative Video Editor Intern hoặc Creative Assistant tại global agency tuyển remote, bắt đầu từ 12/2026 hoặc 01/2027. Portfolio được gửi kèm CV qua email hoặc LinkedIn, nên recruiter đã biết tên Demi.

Người xem là Creative Lead hoặc Producer. Họ cần trả lời nhanh: edit có nhịp và có gu không, làm được định dạng nào, trong dự án nhóm người này làm phần nào, làm việc từ xa có ổn không.

Site chỉ có tiếng Anh.

## Sitemap

| Trang | Đường dẫn | Việc của trang |
|---|---|---|
| Work | `/` | Hero showreel và danh sách tác phẩm, là trang chính |
| Dự án | `/work/[slug]` | Video trước, chữ sau, theo 3 cấp độ case study |
| Playground | `/playground` | Thử nghiệm cá nhân, thêm mới bằng cách sửa file dữ liệu |
| About | `/about` | Cách làm việc, kinh nghiệm, năng lực có bằng chứng |

Contact là phần cuối của mọi trang, không tách trang riêng. Không làm trang đích riêng, vì người xem cần thấy tác phẩm ngay.

**Thanh menu:** cố định ở đầu mọi trang, luôn nhìn thấy khi cuộn. Tên Demi Phan bên trái, bên phải là `■ WORK`, `■ PLAYGROUND`, `■ ABOUT` và nút nổi bật `CONTACT`. Nút này nền đỏ đặc `#FF343B`, chữ đen `#101010` (tương phản khoảng 5:1, chữ trắng chỉ khoảng 3,6:1), không đảo màu theo nền, bấm vào cuộn tới phần Contact. Trên điện thoại nút vẫn hiện cạnh `■ MENU`. Mục đang xem được đánh dấu đỏ. Chữ menu tự đảo màu để đọc được trên cả nền sáng và trên video. Trên điện thoại rút gọn thành `■ MENU`, chạm để mở.

## Trang Work

1. **Hero:** dựng theo mục "Hero theo noartmusic.com" bên dưới.
2. **Selected Work:** list chữ lớn theo kiểu Casey, thay cho lưới thẻ và nút Gallery, Full-Screen. Cột trái có tiêu đề và bộ lọc theo sự kiện, cột giữa là tên dự án kèm năm, tag, vai trò, cột phải là video xem trước. Rê chuột hoặc focus bàn phím vào tên thì chữ đổi đỏ và video đổi theo. Trên điện thoại, mỗi dòng có sẵn thumbnail. List không chạy vòng lặp, cuộn trang vẫn bình thường.
3. **Contact.**

Trang chủ chỉ hiện nhóm Event Campaigns và Social & Digital. Playground có mục riêng trên menu nên không lặp lại ở đây.

## Hero theo noartmusic.com

Demi chọn [noartmusic.com](https://www.noartmusic.com/) làm reference sát cho hero. Làm giống bố cục và hiệu ứng, thay toàn bộ nội dung bằng của Demi. Không dùng logo, footage và câu chữ của No Art.

| Thành phần | Ở No Art | Bản của Demi |
|---|---|---|
| Nền | Video tràn màn hình, cao đúng một màn hình, cắt nhanh, có nhịp đen và nhịp màu | Vòng lặp 15 đến 20 giây dựng từ video của Demi, tránh giây 40 đến 56 của showreel |
| Chính giữa | Logo viết tay, chữ đảo màu theo video (`mix-blend-mode: difference`) | Chữ ký "Demi Phan" cùng hiệu ứng |
| Khung ngắm | 4 góc vuông nhỏ quanh logo, thêm dấu ở mép màn hình | Giữ nguyên, hợp với ý tưởng khung ngắm phòng dựng |
| Trái dưới | Nhãn mono có ô vuông nhỏ và mô tả ngắn | `■ CREATIVE · VIDEO EDITOR · MOTION`, câu giới thiệu "I turn messages into rhythm, then use VFX and motion to push how far video can carry them." |
| Phải dưới | Thẻ thumbnail "Next up" | Thẻ thumbnail `PLAY SHOWREEL 01:29`, mở bản đầy đủ có tiếng |
| Menu | Chữ mono nhỏ có ô vuông, hai hàng; mobile là nút `■ MENU` | Dùng kiểu này cho toàn site |

Khi cuộn, hero trôi lên như bình thường, không bị ghim, phần nền trắng hiện ra ngay. Không có màn hình loading chặn, video hiện ngay trên poster. Bản reduced-motion dừng video ở poster.

Font thêm Chivo Mono (miễn phí) cho nhãn và menu, cùng họ font với reference.

## Danh sách tác phẩm

Nhóm là nơi dự án thuộc về, tag là chất liệu. Vai trò hiện ngay trên thẻ, vì đây là điểm tin cậy mà agency cần và các reference đều chưa làm. Tên tiếng Anh dưới đây là đề xuất theo thuật ngữ phổ biến trong ngành, tên cũ để trong ngoặc.

### Event Campaigns

| Tác phẩm | Sự kiện (bộ lọc) | Tag | Vai trò | File |
|---|---|---|---|---|
| Top 4 Reveal Film (Top 4 Announcement) | Marketing Arena 2026 | Video | Director & Video Editor | `Videos/Marketing Arena/Top 4 Announcement.mp4` |
| Nguyen Hue OOH Spot (OOH) | Marketing Arena 2026 | VFX, Motion | VFX & Motion Artist | `.../animation/ma26-ooh-pho-di-bo.mp4` |
| Registration Countdown (Countdown) | Marketing Arena 2026 | Motion | Motion Designer | `.../animation/cd-end-2.mp4` |
| Key Visual System (Key visuals) | Marketing Arena 2026 | Design | Designer | `.../design/key-post`, 4 file |
| Campaign Social Assets (Social posts) | Marketing Arena 2026 | Design | Art Director & Designer | `.../design/post-nhat/MA26`, 16 file, ẩn 4 post có thí sinh |
| VFX Teaser (VFX Teasers) | Marketing Arena 2025 | VFX, Motion | VFX & Motion Artist | `Videos/Marketing Arena/Teaser-Ma25.mp4` |
| Official Cinematic Trailer | Marketing Arena 2025 | Video | Video Editor | `Videos/Marketing Arena/Official Cinematic Trailer.mp4` |

"Main executive" trong file gốc được đổi thành chức danh quen thuộc với agency nước ngoài (VFX & Motion Artist, Motion Designer). Official Cinematic Trailer là video ghép footage phim: hiển thị dòng "Concept edit. Footage belongs to its original owners." và không xếp đầu.

### Social & Digital

| Tác phẩm | Bộ lọc | Tag | Vai trò | Nguồn |
|---|---|---|---|---|
| Ngoc Ho Medicare: Long-form & Shorts | Ngoc Ho Medicare | Video | [Xác nhận vai trò từng video] | [Video 1](https://youtu.be/PitVgj5neCk), [Video 2](https://youtu.be/25ce-jaLdXg), nhúng YouTube |
| Daily Social Content Series (Social posts series) | Marketing Daily | Design | Designer | `.../design/daily-post`, 5 file, [bài Facebook](https://www.facebook.com/share/p/1CQe1hGzNF/) |
| Seasonal Campaign: Tết & Mid-Autumn | [Thêm sau] | Photo | [Xác nhận vai trò] | Thêm sau |

### Club scope

| Tác phẩm | Bộ lọc | Tag | Vai trò | Nguồn |
|---|---|---|---|---|
| Animated Invitations (Invitations) | Internal Projects 2025 | Motion | [Xác nhận vai trò] | `.../animation/Invitations`, 2 file |

Nhóm này không nằm trong hai nhóm hiện ở trang chủ, nên tạm đặt ở Playground.

Đường dẫn `.../` là `PORTFOLIO WEB/content-raw/previous-works/`.

## Case study

Video luôn lên đầu. Recruiter xem 10 đến 20 giây video trước khi đọc. Có 3 cấp độ theo lượng bằng chứng:

| Cấp | Nội dung | Dự án |
|---|---|---|
| A: Flagship | Video, At a glance, Brief, 2 đến 4 quyết định sáng tạo, Process, Deliverables, Result, What I learned | Marketing Arena 2026 |
| B: Project | Video, At a glance, 2 đến 3 câu bối cảnh và vai trò, 2 đến 3 video khác, một dòng đã học | Marketing Arena 2025, Ngoc Ho Medicare |
| C: Snapshot | Video, At a glance, 1 câu | Animated Invitations, Daily Social Content Series |

Một dòng "First time I..." hoặc "What I'd do differently" trong case study là bằng chứng tự học tốt nhất, không cần tự khen.

### Marketing Arena 2026

Các tác phẩm MA26 ở danh sách trên cùng dẫn về một case study, để người xem thấy Demi hiểu cả chiến dịch.

**Thứ tự trang:** tiêu đề Leader of Creative Communications, video, VFX, motion, rồi social post theo timeline truyền thông.

**At a glance:**

| Trường | Nội dung |
|---|---|
| Client | Marketing Arena 2026. Nationwide marketing competition with 3,087 participants, 1,029 teams and representation from 80 universities |
| My role | Leader of Creative Communications. Led the creative concept, communications plan and audience touchpoints across social, website and event |
| Team | 5 |
| Format | Social-first campaign, 3 months, Facebook and website |
| Tools | Premiere Pro, After Effects, Photoshop |
| Year | 2026 |

**Result (số liệu lấy từ CV):** 2.4M views, 37K+ interactions, 14.2K link clicks, 7K+ website sessions in 3 months. Fanpage 48K+ followers. Exclusive OOH placement at Nguyen Hue pedestrian square, worth nearly US$1,000.

Toàn bộ video do Demi làm. Demi thiết kế và quản lý `marketingarena.vn`. Với post, Demi tự làm một phần và làm director phần còn lại.

**Timeline truyền thông:** Facebook yêu cầu đăng nhập nên chưa đối chiếu được với fanpage. Thứ tự tạm dựa trên ngày in trên post và thứ tự Demi đã nêu:

1. Coming Soon (02.05)
2. Hint Timeline
3. Registration Perks 72H
4. Official Key Visual
5. Registration Countdown (2 Days, 12H)
6. Discover Mentors, Advisors, Judges
7. Round 1 Announcement
8. Gala Night Key Visual, Sold Out
9. Check-in Photobooth, Countdown 48H

## Playground

Bằng chứng của sự tò mò và tự học, không phải năng lực chính. Lưới so le, tự do hơn trang Work, mọi ảnh vẫn có nhãn.

- **Mỗi mục:** ảnh hoặc video, tên, một dòng "Trying: ...". Không cần case study.
- **Nội dung ban đầu:** Photowalk (gallery xếp theo bảng màu), Animated Invitations.
- Dữ liệu nằm trong `content/playground.ts`. Trang để trống phần chưa có, không dùng nội dung giả.

## About

Trả lời câu hỏi "làm việc từ xa với người này có ổn không".

| Thành phần | Nội dung | Trạng thái |
|---|---|---|
| Quan điểm | Một câu về cách Demi nghĩ về edit | [Cần Demi viết] |
| Bio | 3 câu: sinh viên International Economics tại Foreign Trade University, TP.HCM; làm video, motion, VFX cho event campaign và social; nền kinh tế giúp bắt đầu từ mục tiêu và người xem | Câu 3 chờ xác nhận |
| Experience | Creatio, Creative Member từ 11/2024; Marketing Arena 2026, Leader of Creative Communications; Ngoc Ho Medicare, Video Editor, remote, 11/2025 đến 03/2026 | Có sẵn |
| Capabilities | Video editing, Motion graphics, VFX, Visual design. Mỗi mục ghi một dự án chứng minh | Có sẵn |
| Tools | Premiere Pro, After Effects, Photoshop | WordPress, HTML/CSS chờ xác nhận |
| How I work | 3 dòng: đọc brief, rough cut, nhận feedback; một lần tự học kỹ năng mới cho dự án | [Cần Demi cung cấp] |
| Remote info | GMT+7, Available from Dec 2026, English: IELTS 7.0 | Có sẵn |
| CTA | Download CV | Cập nhật sau |

Chân dung `Portrait.png` trên nền đen. Giải thưởng TVCreate và INTERNALATIO đặt trong Experience. Bỏ Photography và Handy craft khỏi Capabilities. Nội dung chỉ lấy từ CV; bản tiếng Anh sẽ được Claude viết và Demi duyệt ở bước design.

## Contact

- Câu mở: "Open to Creative Video Editor / Creative Assistant roles."
- Email lớn `trangbr2006@gmail.com`, nút Copy email, LinkedIn, Download CV.
- Dòng nhỏ: "Based in Ho Chi Minh City (GMT+7) · Open to remote · Available from Dec 2026."

## Stack

Site được dựng lại từ đầu trong thư mục `PORTFOLIO`, Demi đã chốt. `PORTFOLIO WEB` chỉ dùng làm nơi lấy tài sản gốc, không sửa và không lấy code.

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | Next.js 16, TypeScript | Route động cho dự án, tối ưu ảnh |
| Style | Tailwind CSS 4 | Extension đã cài, token dễ chia sẻ với Sixth |
| Motion | GSAP, ScrollTrigger, Lenis | Cùng công cụ với reference chính |
| Nội dung | File dữ liệu `content/projects.ts` | Thêm dự án không cần sửa giao diện |
| Font | Inter Tight, Chivo Mono | Miễn phí, gần font của reference |
| Deploy | Vercel | Miễn phí, hợp với Next.js. Đăng public cần Demi duyệt |

Không dùng WebGL ở bản đầu. Chỉ thêm nếu hiệu ứng tách màu bằng CSS không đủ đẹp.

## Xử lý video

- Showreel đầy đủ: H.264 1080p, mục tiêu dưới 40 MB, từ file 336 MB.
- Video xem trước: 6 đến 8 giây, không tiếng, 720p, dưới 3 MB mỗi file, kèm poster tĩnh.
- Chỉ tải video trong màn hình đang xem. Trên mobile hoặc mạng yếu dùng poster, chạm để phát.
- Reduced-motion: dừng video tự chạy và hiện poster.
- Video tự host, trừ Ngoc Ho Medicare nhúng YouTube. Nếu dung lượng vượt giới hạn Vercel thì chuyển sang Cloudflare R2.

## Việc Demi cần cung cấp

- Vai trò của Demi trong 2 video Ngoc Ho Medicare
- Danh sách post và KV tự làm, phần còn lại ghi là director
- File CV tiếng Anh dùng để tải, đã đổi tên thành Demi Phan
- Link LinkedIn: slug hiện là `trang-phan-aba4a8319`, giữ hay đổi?
- Câu quan điểm và 3 dòng How I work cho About
- Vai trò trong Animated Invitations, nội dung Tết & Mid-Autumn và Photowalk
- Xác nhận thứ tự timeline truyền thông MA26
- Chữ ký "Demi Phan" dạng SVG hoặc PNG nền trong, cho hero
- Vòng lặp hero 15 đến 20 giây do Demi dựng. Nếu chưa có, Claude cắt bản nháp bằng `ffmpeg`

Site vẫn dựng được khi thiếu các mục này, phần thiếu sẽ để placeholder rõ ràng.
