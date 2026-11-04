# Bảng việc chung

Trạng thái: `TODO`, `DOING`, `REVIEW`, `BLOCKED`, `DONE`. Luật xem `PIPELINE.md`.

| ID | Bước | Việc | Người làm | Phạm vi file | Xong khi | Trạng thái | Ghi chú |
|---|---|---|---|---|---|---|---|
| T-01 | 0 | Kiểm kê toàn bộ tài sản dự án | Claude | `content-raw/INVENTORY.md` | Mỗi dự án có danh sách ảnh, video, tài liệu | DONE | Chưa mở nội dung file |
| T-02 | 1 | Phân tích moodboard, reference, CV | Claude | `docs/01-brief.md` | Demi xác nhận thông tin | DONE | Còn phần tài sản Demi cung cấp, xem plan |
| T-03 | 2 | Lập sitemap, nội dung, chọn stack | Claude | `docs/02-plan.md` | Demi duyệt | DONE | Demi đã duyệt |
| T-04 | 3 | Wireframe trên Figma | Claude | Figma | Đủ các trang trong plan | DONE | Demi chuyển sang dev |
| T-05 | 4 | Design draft và design spec | Claude, Demi | Figma, `docs/03-design-spec.md` | Demi duyệt | DONE | Thay bằng `docs/03-design-spec.md`, không làm design draft riêng |
| T-06 | 5 | Tạo project Next.js, TypeScript, Tailwind 4; cài `gsap`, `@gsap/react`, `lenis`; token, font, layout gốc | Sixth | Gốc project, `app/layout.tsx`, `app/globals.css` | `npm run build` và `lint` qua; giữ nguyên `docs`, `design`, `public/media` | TODO | |
| T-07 | 6 | Dữ liệu `content/projects.ts`, `content/playground.ts` | Sixth | `content/` | Đủ dự án trong plan, Medicare `hidden` | TODO | |
| T-08 | 6 | Thanh menu và Contact | Sixth | `components/nav*`, `components/contact*` | Đúng wireframe, dùng được bằng bàn phím | TODO | |
| T-09 | 6 | Hero và dialog showreel | Sixth | `components/hero*` | Đúng spec, cả desktop và mobile | TODO | |
| T-10 | 6 | Selected Work bản tĩnh: 3 tab, list, video xem trước | Sixth | `components/work*`, `app/page.tsx` | Tab dùng được bằng phím, chưa cần lặp | TODO | |
| T-11 | 6 | Trang dự án, gồm case study MA26 và 3 cấp độ | Sixth | `app/work/` | Mọi link trong list mở được | TODO | |
| T-12 | 6 | Trang About và Playground | Sixth | `app/about/`, `app/playground/` | Đúng wireframe | TODO | |
| T-13 | 7 | Review code và giao diện bằng Playwright | Claude | Không sửa code | Có danh sách lỗi trên board | TODO | Chờ T-06 đến T-12 |
| T-14 | 7 | Motion: list lặp, Lenis, hiệu ứng cuộn, reduced-motion | Claude | `components/`, `lib/` | Đúng spec | TODO | Sau T-13 |

Task bước 8 và 9 sẽ được thêm sau.
