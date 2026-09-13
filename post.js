function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[char]));
}

function isYoutubeId(id) {
    return /^[\w-]{11}$/.test(id);
}

function isSafeMediaUrl(url) {
    if (typeof url !== "string" || url.includes("..") || url.includes("<")) return false;
    if (/^https:\/\//i.test(url)) return true;
    return /^[a-zA-Z0-9_./-]+$/.test(url);
}

async function loadPost() {
    const titleEl = document.getElementById("postTitle");
    const playerEl = document.getElementById("player");

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        titleEl.textContent = "Không tìm thấy bài viết (thiếu id trên URL).";
        return;
    }

    try {
        const res = await fetch("data/posts.json");
        const data = await res.json();
        // Hỗ trợ cả cấu trúc mới { posts: [...] } và cũ [...]
        const posts = Array.isArray(data) ? data : (data.posts || []);
        const post = posts.find((item) => item.id === id);

        if (!post) {
            titleEl.textContent = "Không tìm thấy bài viết này.";
            return;
        }

        document.title = post.title;
        titleEl.textContent = post.title;

        // Ưu tiên YouTube nếu còn (tùy chọn)
        if (post.youtubeId && isYoutubeId(post.youtubeId)) {
            const src = `https://www.youtube-nocookie.com/embed/${post.youtubeId}`;
            playerEl.innerHTML = `<iframe src="${src}" title="${escapeHtml(post.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
            return;
        }

        // Video local hoặc URL bên ngoài (R2, Bunny, Drive...)
        if (post.video && isSafeMediaUrl(post.video)) {
            playerEl.innerHTML = `<video controls playsinline preload="metadata"><source src="${post.video}" type="video/mp4"></video>`;
            return;
        }

        titleEl.textContent = "Bài viết này chưa có video hợp lệ.";
    } catch (err) {
        titleEl.textContent = "Có lỗi khi tải bài viết.";
        console.error(err);
    }
}

loadPost();
