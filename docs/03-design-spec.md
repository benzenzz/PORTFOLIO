# Design spec cho dev

Bản ngắn để dựng site từ wireframe. Demi chưa làm bước design draft riêng, nên file này là nguồn chính về màu, chữ và motion. Wireframe chỉ quyết định bố cục: màu xám trong wireframe là chỗ giữ cho video và ảnh, không phải màu cuối.

Nội dung chữ lấy từ `docs/02-plan.md`. Bối cảnh lấy từ `docs/01-brief.md`. Quy tắc chất lượng lấy từ `CLAUDE.md`.

## Wireframe

Figma: https://www.figma.com/design/vxY5Tr69ZwUk5VgZJlWzqk (chỉ để Demi xem, dev dùng ảnh).

| Phần | Ảnh desktop | Ảnh mobile |
|---|---|---|
| Hero | `design/wireframes/hero-desktop.png` | `design/wireframes/hero-mobile.png` |
| Selected Work | `design/wireframes/work-desktop.png` | `design/wireframes/work-mobile.png` |
| Case study | `design/wireframes/case-study-desktop.png` | `design/wireframes/case-study-mobile.png` |
| About | `design/wireframes/about-desktop.png` | `design/wireframes/about-mobile.png` |
| Playground | `design/wireframes/playground-desktop.png` | `design/wireframes/playground-mobile.png` |
| Contact | `design/wireframes/contact-desktop.png` | `design/wireframes/contact-mobile.png` |

## Token

```css
--color-ink: #101010;
--color-paper: #F5F4F0;
--color-red: #FF343B;
--color-gray: #6F6F6F;        /* chữ phụ trên nền sáng */
--color-gray-dark: #B8B8B8;   /* chữ phụ trên nền tối */
--color-dim: #8C8C8C;         /* tên dự án chưa chọn, chỉ dùng cho chữ lớn */
--color-line: rgba(16, 16, 16, 0.16);
--color-line-dark: rgba(255, 255, 255, 0.2);

--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--dur-fast: 180ms;
--dur-base: 400ms;
--dur-slow: 700ms;
```

Trang Work và Playground nền `--color-paper`. Hero, Case study, About và Contact nền `--color-ink`. Đỏ chỉ dùng cho trạng thái đang chọn, nút chính và focus. Trên nền đỏ dùng chữ `--color-ink`, không dùng chữ trắng.

## Chữ

- Tiêu đề và tên dự án: Inter Tight Bold, `letter-spacing: -0.03em`
- Nội dung: Inter Tight Regular
- Nhãn, menu, metadata: Chivo Mono Medium, chữ hoa

Dùng `next/font/google`, không tải file font thủ công.

| Vai trò | Cỡ |
|---|---|
| Tiêu đề trang | `clamp(3rem, 10vw, 9rem)` |
| Tên dự án trong list | `clamp(1.25rem, 3.1vw, 2.75rem)` |
| Email Contact | `clamp(1.75rem, 7.2vw, 6.5rem)` |
| Nội dung | `1rem` đến `1.125rem` |
| Nhãn mono | `0.75rem`, tối thiểu `0.6875rem` |

## Bố cục

Lề ngang 32px trên desktop, 16px trên mobile. Điểm chuyển mobile dưới 768px. Khoảng cách các khối theo bội số của 8px. Không có bo góc, bóng hay gradient.

## Hành vi từng phần

**Thanh menu:** `position: fixed`, trên cùng. Tên và mục menu dùng `mix-blend-mode: difference` với chữ trắng để đọc được trên mọi nền. Nút CONTACT không dùng blend, là `<a href="#contact">`. Trên mobile có nút `■ MENU` mở panel toàn màn hình, đóng được bằng Esc.

**Hero:** cao `100svh`, video `public/media/hero/loop.mp4` tràn màn hình, `autoPlay muted loop playsInline`, có poster. Chữ ký tạm dùng chữ "Demi Phan" trong `<h1>` với `mix-blend-mode: difference`, bọc bởi 4 góc khung ngắm 14px, để sau này thay bằng SVG. Có lớp gradient tối nhẹ sau chữ góc trái dưới. Thẻ showreel là nút mở dialog phát `showreel.mp4` có tiếng và điều khiển, đóng bằng Esc và trả focus về nút. Không có màn hình loading.

**Selected Work:** 3 tab là `role="tablist"`, dùng được bằng phím mũi tên, mặc định Video Editor. Mỗi hàng là `<a href="/work/[slug]">`. Rê chuột hoặc focus vào hàng thì tên đổi đỏ và khung phải đổi video xem trước.

Trên desktop, list lặp: section ghim bằng GSAP ScrollTrigger trong khoảng 200vh rồi nhả ra, list dịch theo cuộn và quay vòng. Chỉ bản đầu tiên của list dùng được bằng bàn phím và trình đọc màn hình, các bản lặp có `aria-hidden` và `tabIndex={-1}`. Không chặn sự kiện cuộn của người dùng.

Trên mobile và khi reduced-motion: không ghim, không lặp, list tĩnh.

**Case study:** video đầu trang có điều khiển, không tự bật tiếng. Timeline post là vùng `overflow-x: auto`, có `tabIndex={0}` và nhãn. Ô ngoặc vuông trong plan hiện nguyên văn để Demi thấy, sẽ thay trước khi ra mắt.

**About:** trên desktop, chân dung `position: sticky`.

**Contact:** có `id="contact"`, nằm cuối mọi trang. Copy Email dùng Clipboard API, đổi chữ thành "Copied" trong 2 giây, kèm `aria-live="polite"`.

## Motion

Dùng GSAP, ScrollTrigger và Lenis. Mỗi hiệu ứng dọn dẹp trong `useGSAP` hoặc cleanup.

- Nút và link: đổi màu trong `--dur-fast`.
- Khối nội dung: hiện dần và trượt lên 24px trong `--dur-base`, chạy một lần.
- Chuyển trang và video trong list: đổi nhanh, không fade dài.

`prefers-reduced-motion: reduce`: tắt Lenis, ghim, lặp, video tự chạy, chỉ hiện poster. Site phải đầy đủ khi không có JavaScript animation.

## Media

Toàn bộ nằm trong `public/media`, không đọc thư mục gốc.

| Đường dẫn | Nội dung |
|---|---|
| `hero/loop.mp4`, `hero/showreel.mp4`, `hero/poster.jpg` | Hero. `loop.mp4` là bản nháp |
| `work/[slug]/full.mp4`, `preview.mp4`, `poster.jpg` | 5 slug: `top-4-reveal-film`, `official-cinematic-trailer`, `vfx-teaser`, `nguyen-hue-ooh-spot`, `registration-countdown` |
| `kv/`, `social/`, `daily/`, `invitations/` | Ảnh và video phụ |
| `about/portrait.jpg` | Chân dung |

Video xem trước chỉ tải khi cần (`preload="none"`, poster luôn hiện). Trên mobile dùng poster, không tự chạy. Ảnh dùng `next/image`.

Slug `key-visual-system`, `campaign-social-assets`, `daily-social-content-series` không có video, dùng ảnh trong `kv/`, `social/`, `daily/` làm preview.

Official Cinematic Trailer luôn có dòng: "Concept edit. Footage belongs to its original owners."

## Dữ liệu

Toàn bộ nội dung dự án nằm trong `content/projects.ts` và `content/playground.ts`. Component không chứa chữ cứng của dự án. Ngoc Ho Medicare có trong dữ liệu với `hidden: true`.
