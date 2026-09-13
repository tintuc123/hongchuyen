function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[char]));
}

function sortPosts(posts) {
    return [...posts].sort((a, b) => {
        const aTime = a.published ? Date.parse(a.published) : 0;
        const bTime = b.published ? Date.parse(b.published) : 0;
        if (aTime || bTime) return bTime - aTime;
        return 0;
    });
}

async function loadPostList() {
    const container = document.getElementById("postList");

    try {
        const res = await fetch("data/posts.json");
        const data = await res.json();
        // Hỗ trợ cả cấu trúc mới { posts: [...] } và cũ [...]
        const posts = Array.isArray(data) ? data : (data.posts || []);

        if (!posts.length) {
            container.innerHTML = "<p>Chưa có bài viết nào.</p>";
            return;
        }

        const hasDates = posts.some((post) => post.published);
        const ordered = hasDates ? sortPosts(posts) : [...posts].reverse();

        container.innerHTML = ordered.map((post) => `
            <a class="post-card" href="post.html?id=${encodeURIComponent(post.id)}">
                <img src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}" loading="lazy">
                <div class="post-card-title">${escapeHtml(post.title)}</div>
            </a>
        `).join("");
    } catch (err) {
        container.innerHTML = "<p>Không tải được danh sách bài viết.</p>";
        console.error(err);
    }
}

loadPostList();
