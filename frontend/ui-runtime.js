import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';

async function startStaticServer() {
    const PORT = 3002;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            if (req.url === '/' || req.url === '/index.html') {
                const html = fs.readFileSync(path.join(__dirname, 'index.html'));
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
                return;
            }
            if (req.url === '/manifest.json') {
                const manifest = fs.readFileSync(path.join(__dirname, 'manifest.json'));
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(manifest);
                return;
            }
            if (req.url === '/icon192x192.png') {
                const icon = fs.readFileSync(path.join(__dirname, 'icon192x192.png'));
                res.writeHead(200, { 'Content-Type': 'image/png'});
                res.end(icon);
                return;
            }
            res.writeHead(404);
            res.end();
        });
        server.listen(PORT, () => {
            resolve(`http://localhost:${PORT}`);
        })
    })
}
async function launchUI(webUrl) {
    await puppeteer.launch({
        headless: false,
        args: [
            '--app=' + `${webUrl}`
        ],
        defaultViewport: null
    });
};
export default async function bootstrapUI() {
    const webUrl = await startStaticServer();
    await launchUI(webUrl);
}