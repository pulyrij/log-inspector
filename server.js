import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/logs') {

        let body = "";
        
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const log = JSON.parse(body);

                console.log('LOG RECEIVED');
                console.log(log);

                res.writeHead(204);
                res.end();
            } catch (err) {

                res.writeHead(400);
                res.end("Invalid JSON");
            }
        });
        
        return;
    }
    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log(`Logger server running on port${PORT}`);
});