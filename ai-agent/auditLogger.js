 const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "execution-audit.jsonl");

const REQUIRED_FIELDS = [
    "event",
    "stage"
];

function validateAuditEvent(event) {
    if (!event || typeof event !== "object") {
        throw new Error(
            "Audit event must be an object"
        );
    }

    for (const field of REQUIRED_FIELDS) {
        if (
            event[field] === undefined ||
            event[field] === null ||
            event[field] === ""
        ) {
            throw new Error(
                `Audit event missing required field: ${field}`
            );
        }
    }

    return true;
}

function writeAuditLog(event) {
    validateAuditEvent(event);

    fs.mkdirSync(LOG_DIR, { recursive: true });

    const record = {
        timestamp: new Date().toISOString(),
        ...event
    };

    fs.appendFileSync(
        LOG_FILE,
        JSON.stringify(record) + "\n",
        "utf8"
    );

    return record;
}

function verifyAuditLog() {
    if (!fs.existsSync(LOG_FILE)) {
        return {
            total: 0,
            valid: 0,
            invalid: 0,
            errors: []
        };
    }

    const lines =
        fs.readFileSync(
            LOG_FILE,
            "utf8"
        )
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    let valid = 0;
    let invalid = 0;
    const errors = [];

    lines.forEach((line, index) => {
        try {
            const cleanLine =
                line.replace(/^\uFEFF/, "");

            const record =
                JSON.parse(cleanLine);

            validateAuditEvent(record);

            valid++;
        } catch (error) {
            invalid++;

            errors.push({
                line: index + 1,
                error: error.message
            });
        }
    });

    return {
        total: lines.length,
        valid,
        invalid,
        errors
    };
}

function generateAuditReport() {
    if (!fs.existsSync(LOG_FILE)) {
        return {
            totalRecords: 0,
            validRecords: 0,
            invalidRecords: 0,
            aiDecisions: 0,
            agentErrors: 0,
            signals: {
                LONG: 0,
                SHORT: 0,
                HOLD: 0
            },
            decisionSummary: {
                long: 0,
                short: 0,
                hold: 0
            },
            averageRiskScore: 0,
            totalPositionSize: 0,
            latestDecision: null,
            chainId: null,
            contractAddress: null,
            dryRun: true
        };
    }

    const lines =
        fs.readFileSync(
            LOG_FILE,
            "utf8"
        )
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    const records = [];

    let invalidRecords = 0;

    for (const line of lines) {
        try {
            const cleanLine =
                line.replace(/^\uFEFF/, "");

            const record =
                JSON.parse(cleanLine);

            validateAuditEvent(record);

            records.push(record);
        } catch (error) {
            invalidRecords++;
        }
    }

    const decisions =
        records.filter(
            record =>
                record.event === "AI_DECISION"
        );

    const errors =
        records.filter(
            record =>
                record.event === "AGENT_ERROR"
        );

    const signals = {
        LONG: 0,
        SHORT: 0,
        HOLD: 0
    };

    let totalRiskScore = 0;
    let totalPositionSize = 0;

    let longDecisions = 0;
    let shortDecisions = 0;
    let holdDecisions = 0;

    for (const decision of decisions) {
        const signal =
            String(
                decision.finalSignal || "HOLD"
            ).toUpperCase();

        if (
            Object.prototype.hasOwnProperty.call(
                signals,
                signal
            )
        ) {
            signals[signal]++;
        }

        if (signal === "LONG") {
            longDecisions++;
        } else if (signal === "SHORT") {
            shortDecisions++;
        } else if (signal === "HOLD") {
            holdDecisions++;
        }

        totalRiskScore +=
            Number(decision.riskScore) || 0;

        totalPositionSize +=
            Number(decision.positionSize) || 0;
    }

    const latestDecision =
        decisions.length > 0
            ? decisions[decisions.length - 1]
            : null;

    return {
        totalRecords: lines.length,
        validRecords: records.length,
        invalidRecords,
        aiDecisions: decisions.length,
        agentErrors: errors.length,
        signals,
        decisionSummary: {
            long: longDecisions,
            short: shortDecisions,
            hold: holdDecisions
        },
        averageRiskScore:
            decisions.length > 0
                ? Number(
                    (
                        totalRiskScore /
                        decisions.length
                    ).toFixed(2)
                )
                : 0,
        totalPositionSize,
        latestDecision,
        chainId:
            latestDecision?.chainId ||
            records[records.length - 1]?.chainId ||
            null,
        contractAddress:
            latestDecision?.contractAddress ||
            records[records.length - 1]?.contractAddress ||
            null,
        dryRun:
            latestDecision?.dryRun ??
            records[records.length - 1]?.dryRun ??
            true
    };
}

module.exports = {
    writeAuditLog,
    validateAuditEvent,
    verifyAuditLog,
    generateAuditReport,
    LOG_FILE
};