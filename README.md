# Website Video / Tin tức (có Admin miễn phí)

Dự án website static hoàn toàn **miễn phí**, **không cần database**, có **giao diện Admin** để thêm/sửa video dễ dàng.

## Tính năng

- Danh sách video đẹp, responsive
- Trang xem video (hỗ trợ file local + link ngoài)
- **Admin CMS** (Sveltia CMS) – thêm bài bằng giao diện, không cần sửa code
- Không dùng YouTube
- Host hoàn toàn miễn phí (GitHub Pages / Cloudflare Pages / Netlify)
- Video nên để bên ngoài (Cloudflare R2, Bunny...) để repo nhẹ

---

## Cấu trúc thư mục

```
website-mo-rong/
├── admin/                  ← Giao diện Admin
│   ├── index.html
│   └── config.yml          ← Cấu hình CMS (quan trọng)
├── data/
│   └── posts.json          ← Dữ liệu tất cả video (Admin sửa file này)
├── jpg/                    ← Ảnh thumbnail
├── video/                  ← (tùy chọn) video local nhỏ, nên tránh file lớn
├── index.html              ← Trang danh sách
├── post.html               ← Trang xem video
├── list.js, post.js, app.js, style.css
└── README.md
```

---

## 1. Cách thêm video mới (sau khi setup xong)

1. Vào trang Admin: `https://your-site.com/admin/`
2. Đăng nhập bằng GitHub
3. Vào **Danh sách Video** → thêm / sửa
4. Điền:
   - **ID**: duy nhất (ví dụ `3`, `video-abc`)
   - **Tiêu đề**
   - **Link Video**: dán URL đầy đủ (https://...)
   - **Ảnh thumbnail**: upload hoặc dán link
   - **Ngày đăng** (tùy chọn)
5. Bấm **Save** → website tự cập nhật

---

## 2. Thiết lập lần đầu (chỉ làm 1 lần)

### Bước 1: Đẩy dự án lên GitHub

1. Tạo repo mới trên GitHub (public hoặc private đều được)
2. Upload toàn bộ thư mục này lên repo
3. Sửa file `admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME   # ← sửa thành repo thật
     branch: main
   ```

### Bước 2: Host website miễn phí

**Khuyến nghị: Cloudflare Pages** (băng thông không giới hạn)

1. Vào [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Build settings:
   - Framework preset: **None**
   - Build command: (để trống)
   - Output directory: `/` (hoặc để trống)
4. Deploy → có link website

Hoặc dùng **GitHub Pages** / **Netlify** cũng được.

### Bước 3: Thiết lập đăng nhập Admin (OAuth)

Sveltia CMS cần OAuth để đăng nhập GitHub an toàn.

**Cách dễ nhất (dùng sveltia-cms-auth trên Cloudflare Workers):**

1. Vào GitHub → tạo **OAuth App**:
   - Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `Sveltia CMS`
   - Homepage URL: `https://your-site.pages.dev` (hoặc domain thật)
   - Authorization callback URL: `https://your-worker.workers.dev/callback` (sẽ có sau)
2. Ghi lại **Client ID** và **Client Secret**
3. Deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth):
   - Fork repo hoặc Deploy to Cloudflare Workers
   - Thêm Environment Variables:
     - `GITHUB_CLIENT_ID`
     - `GITHUB_CLIENT_SECRET`
     - `ALLOWED_DOMAINS` = domain website của bạn (cách nhau bởi dấu phẩy)
4. Lấy URL Worker (ví dụ `https://sveltia-cms-auth.xxx.workers.dev`)
5. Sửa lại `admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
     branch: main
     base_url: https://sveltia-cms-auth.xxx.workers.dev
     auth_endpoint: auth
   ```
6. Cập nhật Callback URL của OAuth App thành `https://sveltia-cms-auth.xxx.workers.dev/callback`

Sau đó vào `/admin` sẽ đăng nhập được bằng GitHub.

> **Mẹo**: Nếu bạn dùng Netlify, có thể dùng Git Gateway + Netlify Identity (cách cũ của Decap), nhưng Sveltia khuyến khích cách OAuth trên.

---

## 3. Lưu trữ video (quan trọng)

**Không nên** upload file `.mp4` lớn vào GitHub (repo sẽ nặng, push chậm).

**Nên dùng:**

| Dịch vụ              | Ưu điểm                          | Link |
|----------------------|----------------------------------|------|
| **Cloudflare R2**    | Free tier tốt, không mất phí egress | [r2.cloudflare.com](https://www.cloudflare.com/products/r2/) |
| **Bunny.net Storage**| Rẻ, CDN nhanh                    | [bunny.net](https://bunny.net) |
| **Backblaze B2**     | Rẻ                               | [backblaze.com](https://www.backblaze.com/b2) |
| Google Drive / Mega  | Free nhưng link dễ chết / chậm   | - |

Cách dùng R2 (khuyến nghị):
1. Tạo bucket R2
2. Bật Public Access hoặc dùng Custom Domain
3. Upload video → copy link công khai
4. Dán link vào field **Link Video** trên Admin

---

## 4. Xóa video local cũ (tùy chọn)

Sau khi chuyển sang link ngoài, bạn có thể xóa thư mục `video/` và các file `.mp4` để repo nhẹ hơn.

File `.gitignore` đã có sẵn `video/*.mp4`.

---

## 5. Chạy local để test

```bash
# Cài extension Live Server trên VS Code, hoặc dùng:
npx serve .
```

Sau đó mở:
- Website: http://localhost:3000
- Admin: http://localhost:3000/admin/

(Lưu ý: Admin local cần cấu hình backend GitHub + OAuth mới đăng nhập được. Có thể test bằng cách sửa `posts.json` trực tiếp.)

---

## Tóm tắt quy trình hàng ngày

1. Upload video lên R2 / Bunny → lấy link
2. Vào `/admin` → thêm video mới (dán link + upload thumbnail)
3. Save → xong. Website tự hiện bài mới.

Không cần sửa code, không cần push thủ công, không cần database.
