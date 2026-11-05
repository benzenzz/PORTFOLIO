# Bảng việc chung

Trạng thái: `TODO`, `DOING`, `REVIEW`, `BLOCKED`, `DONE`. Luật xem `PIPELINE.md`.

| ID | Bước | Việc | Người làm | Phạm vi file | Xong khi | Trạng thái | Ghi chú |
|---|---|---|---|---|---|---|---|
| T-01 | 0 | Kiểm kê toàn bộ tài sản dự án | Claude | `content-raw/INVENTORY.md` | Mỗi dự án có danh sách ảnh, video, tài liệu | DONE | Chưa mở nội dung file |
| T-02 | 1 | Phân tích moodboard, reference, CV | Claude | `docs/01-brief.md` | Demi xác nhận thông tin | DONE | Còn phần tài sản Demi cung cấp, xem plan |
| T-03 | 2 | Lập sitemap, nội dung, chọn stack | Claude | `docs/02-plan.md` | Demi duyệt | DONE | Demi đã duyệt |
| T-04 | 3 | Wireframe trên Figma | Claude | Figma | Đủ các trang trong plan | DONE | Demi chuyển sang dev |
| T-05 | 4 | Design draft và design spec | Claude, Demi | Figma, `docs/03-design-spec.md` | Demi duyệt | DONE | Thay bằng `docs/03-design-spec.md`, không làm design draft riêng |
| T-06 | 5 | Tạo project Next.js, TypeScript, Tailwind 4; cài `gsap`, `@gsap/react`, `lenis`; token, font, layout gốc | Sixth | Gốc project, `app/layout.tsx`, `app/globals.css` | `npm run build` và `lint` qua; giữ nguyên `docs`, `design`, `public/media` | REVIEW | Next 16.4.5, React 19.3.1, Tailwind 4.3.4, GSAP 3.15.1, Lenis 1.3.27. Build + lint qua. Font Inter Tight / Chivo Mono qua `next/font`, token trong `app/globals.css`. `app/page.tsx` tạm là placeholder, thay ở T-10 |
| T-07 | 6 | Dữ liệu `content/projects.ts`, `content/playground.ts` | Sixth | `content/` | Đủ dự án trong plan, Medicare `hidden` | REVIEW | Claude làm thay Sixth. Có đủ dự án trong plan, Medicare và Seasonal `hidden`. Năm của Daily series và các ô ngoặc vuông chờ Demi |
| T-08 | 6 | Thanh menu và Contact | Sixth | `components/nav*`, `components/contact*` | Đúng wireframe, dùng được bằng bàn phím | REVIEW | Claude làm thay Sixth. Menu dùng `<dialog>` nên có sẵn Esc và trả focus. Sửa thêm `app/layout.tsx`, thêm `content/site.ts`. CV chưa có file nên hiện ô ngoặc vuông |
| T-09 | 6 | Hero và dialog showreel | Sixth | `components/hero*` | Đúng spec, cả desktop và mobile | REVIEW | Claude làm thay Sixth. Đúng spec. `loop.mp4` vẫn là bản nháp, chữ ký tạm dùng chữ |
| T-10 | 6 | Selected Work bản tĩnh: 3 tab, list, video xem trước | Sixth | `components/work*`, `app/page.tsx` | Tab dùng được bằng phím, chưa cần lặp | REVIEW | Claude làm thay Sixth. Tab dùng được bằng phím mũi tên, Home, End. Chưa lặp, để T-14 |
| T-11 | 6 | Trang dự án, gồm case study MA26 và 3 cấp độ | Sixth | `app/work/` | Mọi link trong list mở được | REVIEW | Claude làm thay Sixth. Dự án MA26 link về đúng khối trong case study. Ô ngoặc vuông chờ Demi, thứ tự timeline post chờ đối chiếu fanpage |
| T-12 | 6 | Trang About và Playground | Sixth | `app/about/`, `app/playground/` | Đúng wireframe | REVIEW | Claude làm thay Sixth. Chưa có ảnh Photowalk nên hiện ô giữ chỗ. Quan điểm, câu bio 3, How I work chờ Demi |
| T-13 | 7 | Review code và giao diện bằng Playwright | Claude | Không sửa code | Có danh sách lỗi trên board | TODO | Claude đã tự QA lúc làm thay Sixth: 4 khổ màn hình, bàn phím, dialog, reduced-motion, link, ảnh, video. Chưa có người khác review |
| T-14 | 7 | Motion: list lặp, Lenis, hiệu ứng cuộn, reduced-motion | Claude | `components/`, `lib/` | Đúng spec | DOING | Xong hero: loader, Lenis, con trỏ khung ngắm, parallax, wipe, scramble, chữ né chuột, halftone. Thêm section giới thiệu trước Selected Work theo curtisdesignr.me. Còn Selected Work, case study, About, Playground, Contact, chuyển trang |
| T-15 | 7 | Phase 1 trang chủ mới: cảnh đồng cỏ, khối cube D-E-M-I, vệt khói, trời sao, sao băng | Claude | `lib/meadow-scene.ts`, `components/meadow-lab.tsx`, `app/lab/` | Demi ưng cảnh ở `/lab`, chạy mượt trên laptop và điện thoại | REVIEW | Kế hoạch ở `docs/06-home-rebuild-plan.md`. Đã thêm camera đổi góc theo từng chữ, hạ cỏ tiền cảnh, cube phản ứng theo vệt chuột. Đã làm lại phong cảnh theo emotion (sông phản chiếu, núi đá, mây, trăng) và hiệu ứng chuột 4 lớp. Đã thêm hậu kỳ threshold, shutter blur và quầng vàng, mặc định nền sáng, xem nền tối bằng `?look=night`. Mặc định nền tối, nền sáng ở `?look=paper`. Chuột chạm chữ thì nổ thành hạt vàng, thêm 4 nhịp kể chuyện. Chưa đo được độ mượt trên máy thật |

Task bước 8 và 9 sẽ được thêm sau.
