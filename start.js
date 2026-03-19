// start.js
const fs = require("fs");
const path = require("path");
const basePath = process.cwd();

if (process.env.CLEAR_WWEBJS === "true") {
    try {
        const candidates = [
            // docker (volumes mount into /app/.wwebjs_*)
            path.join(basePath, ".wwebjs_auth"),
            path.join(basePath, ".wwebjs_cache"),
            // local (common defaults)
            path.join(__dirname, ".wwebjs_auth"),
            path.join(__dirname, ".wwebjs_cache"),
            // host-mapped folder names (when running locally without bind-mount remap)
            path.join(__dirname, ".wwebjs_auth_docker"),
            path.join(__dirname, ".wwebjs_cache_docker"),
            // chromium tmp dir sometimes used by whatsapp-web.js/puppeteer
            "/tmp/chromium-whatsapp",
        ];

        const unique = Array.from(new Set(candidates));
        const removed = [];

        for (const p of unique) {
            try {
                if (fs.existsSync(p)) {
                    fs.rmSync(p, { recursive: true, force: true });
                    removed.push(p);
                }
            } catch (err) {
                console.error(`Erro removendo "${p}":`, err);
            }
        }

        if (removed.length) {
            console.log("Pastas/arquivos limpos:", removed);
        } else {
            console.log("Nada para limpar (nenhum caminho encontrado).", {
                basePath,
                __dirname,
            });
        }
    } catch (e) {
        console.error("Erro limpando pastas .wwebjs_*:", e);
    }
}

require("./chatbot.js");