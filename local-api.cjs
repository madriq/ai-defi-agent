const http = require("http");

const { runHealthCheck } = require("./ai-agent/health-check");
const { generateAuditReport } = require("./ai-agent/auditLogger");

const PORT = 8787;

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Cache-Control": "no-store"
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    try {
        if (req.method !== "GET") {
            return sendJson(res, 405, {
                error: "Method not allowed"
            });
        }

        if (req.url === "/api/status") {
            const health = await runHealthCheck();
            return sendJson(res, 200, health);
        }

        if (req.url === "/api/audit") {
            const report = generateAuditReport();
            return sendJson(res, 200, report);
        }

        return sendJson(res, 404, {
            error: "Not found"
        });
    } catch (error) {
        return sendJson(res, 500, {
            error: error.message
        });
    }
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`Local read-only API running at http://127.0.0.1:${PORT}`);
});
