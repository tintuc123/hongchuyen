function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[char]));
}

function isSafeMediaUrl(url) {
    if (typeof url !== "string" || url.includes("..") || url.includes("<")) return false;
    if (/^https:\/\//i.test(url)) return true;
    return /^[a-zA-Z0-9_./-]+$/.test(url);
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (char === '"' && next === '"') {
                cell += '"';
                i += 1;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                cell += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            row.push(cell);
            cell = "";
        } else if (char === "\n") {
            row.push(cell.replace(/\r$/, ""));
            rows.push(row);
            row = [];
            cell = "";
        } else {
            cell += char;
        }
    }

    if (cell.length || row.length) {
        row.push(cell.replace(/\r$/, ""));
        rows.push(row);
    }

    return rows.filter((item) => item.some((value) => String(value).trim() !== ""));
}

function normalizeHeader(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function sheetIdFromValue(value) {
    const raw = String(value || "").trim();
    const fromUrl = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return fromUrl ? fromUrl[1] : raw;
}

function csvUrlFromConfig(config) {
    if (config.sheetCsvUrl) return String(config.sheetCsvUrl).trim();
    if (!config.googleSheetId) return "";
    const id = sheetIdFromValue(config.googleSheetId);
    if (!id) return "";
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
}

function postsFromCsv(csvText) {
    const rows = parseCsv(csvText);
    if (rows.length < 2) return [];

    const headerMap = {
        id: "id",
        title: "title",
        "tieu de": "title",
        video: "video",
        thumbnail: "thumbnail",
        anh: "thumbnail",
        "anh bia": "thumbnail",
        published: "published",
        ngay: "published",
    };

    const headers = rows[0].map((name) => headerMap[normalizeHeader(name)] || "");
    const posts = [];

    for (const row of rows.slice(1)) {
        const post = {};
        headers.forEach((key, index) => {
            if (key) post[key] = String(row[index] || "").trim();
        });
        if (!post.id || !post.title || !post.video) continue;
        posts.push(post);
    }

    return posts;
}

async function loadPosts() {
    const configRes = await fetch("data/config.json");
    const config = configRes.ok ? await configRes.json() : {};
    const csvUrl = csvUrlFromConfig(config);

    if (csvUrl) {
        const sheetRes = await fetch(csvUrl);
        if (!sheetRes.ok) {
            throw new Error("Không đọc được Google Sheet. Hãy chia sẻ sheet: Anyone with the link can view.");
        }
        return postsFromCsv(await sheetRes.text());
    }

    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error("Không tải được danh sách bài viết.");
    return res.json();
}
