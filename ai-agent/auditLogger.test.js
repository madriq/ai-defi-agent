const assert = require("assert");
const fs = require("fs");

const {
    writeAuditLog,
    validateAuditEvent,
    verifyAuditLog,
    generateAuditReport,
    LOG_FILE
} = require("./auditLogger");

function resetLog() {
    if (fs.existsSync(LOG_FILE)) {
        fs.unlinkSync(LOG_FILE);
    }
}

function testValidAuditEvent() {
    resetLog();

    const record = writeAuditLog({
        event: "AI_DECISION",
        stage: "DECISION_ENGINE",
        finalSignal: "LONG",
        riskScore: 60,
        positionSize: 10,
        chainId: "31337",
        dryRun: true
    });

    assert.strictEqual(record.event, "AI_DECISION");
    assert.strictEqual(record.stage, "DECISION_ENGINE");
    assert.ok(record.timestamp);

    console.log("✔ Valid audit event is written");
}

function testMissingRequiredField() {
    assert.throws(
        () => validateAuditEvent({
            event: "AI_DECISION"
        }),
        /Audit event missing required field: stage/
    );

    console.log("✔ Missing required field is rejected");
}

function testAuditLogVerification() {
    resetLog();

    writeAuditLog({
        event: "AI_DECISION",
        stage: "DECISION_ENGINE",
        finalSignal: "LONG",
        riskScore: 60,
        positionSize: 10
    });

    writeAuditLog({
        event: "AGENT_ERROR",
        stage: "AGENT",
        errorName: "TestError",
        errorMessage: "Test error"
    });

    const result = verifyAuditLog();

    assert.strictEqual(result.total, 2);
    assert.strictEqual(result.valid, 2);
    assert.strictEqual(result.invalid, 0);

    console.log("✔ Valid audit log is verified");
}

function testInvalidAuditLog() {
    resetLog();

    writeAuditLog({
        event: "AI_DECISION",
        stage: "DECISION_ENGINE",
        finalSignal: "LONG"
    });

    fs.appendFileSync(
        LOG_FILE,
        "{invalid-json}\n",
        "utf8"
    );

    const result = verifyAuditLog();

    assert.strictEqual(result.total, 2);
    assert.strictEqual(result.valid, 1);
    assert.strictEqual(result.invalid, 1);
    assert.strictEqual(result.errors.length, 1);

    console.log("✔ Invalid audit record is detected");
}

function testAuditReport() {
    resetLog();

    writeAuditLog({
        event: "AI_DECISION",
        stage: "DECISION_ENGINE",
        finalSignal: "LONG",
        riskScore: 60,
        positionSize: 10,
        chainId: "31337",
        contractAddress: "0xLOCAL",
        dryRun: true
    });

    writeAuditLog({
        event: "AI_DECISION",
        stage: "DECISION_ENGINE",
        finalSignal: "HOLD",
        riskScore: 0,
        positionSize: 0,
        chainId: "31337",
        contractAddress: "0xLOCAL",
        dryRun: true
    });

    writeAuditLog({
        event: "AGENT_ERROR",
        stage: "AGENT",
        errorName: "TestError",
        errorMessage: "Test error",
        chainId: "31337",
        contractAddress: "0xLOCAL",
        dryRun: true
    });

    const report = generateAuditReport();

    assert.strictEqual(report.totalRecords, 3);
    assert.strictEqual(report.validRecords, 3);
    assert.strictEqual(report.invalidRecords, 0);
    assert.strictEqual(report.aiDecisions, 2);
    assert.strictEqual(report.agentErrors, 1);
    assert.strictEqual(report.signals.LONG, 1);
    assert.strictEqual(report.signals.HOLD, 1);
    assert.strictEqual(report.decisionSummary.long, 1);
    assert.strictEqual(report.decisionSummary.hold, 1);
    assert.strictEqual(report.averageRiskScore, 30);
    assert.strictEqual(report.totalPositionSize, 10);
    assert.strictEqual(report.chainId, "31337");
    assert.strictEqual(report.dryRun, true);

    console.log("✔ Audit report summary is correct");
}

function cleanup() {
    resetLog();
}

try {
    console.log("\n================================");
    console.log("🧪 AUDIT LOGGER TESTS");
    console.log("================================");

    testValidAuditEvent();
    testMissingRequiredField();
    testAuditLogVerification();
    testInvalidAuditLog();
    testAuditReport();

    console.log("\n🎉 ALL AUDIT LOGGER TESTS PASSED");
} finally {
    cleanup();
}