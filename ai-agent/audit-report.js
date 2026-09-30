const {
    generateAuditReport
} = require("./auditLogger");

const report =
    generateAuditReport();

console.log("\n========================================");
console.log("        AI DEFI AGENT AUDIT REPORT");
console.log("========================================");

console.log(
    "\nRecords"
);

console.log(
    "Total Records:       ",
    report.totalRecords
);

console.log(
    "Valid Records:       ",
    report.validRecords
);

console.log(
    "Invalid Records:     ",
    report.invalidRecords
);

console.log(
    "AI Decisions:        ",
    report.aiDecisions
);

console.log(
    "Agent Errors:        ",
    report.agentErrors
);

console.log(
    "\nSignals"
);

console.log(
    "LONG:                ",
    report.signals.LONG
);

console.log(
    "SHORT:               ",
    report.signals.SHORT
);

console.log(
    "HOLD:                ",
    report.signals.HOLD
);

console.log(
    "\nRisk"
);

console.log(
    "Average Risk Score:  ",
    report.averageRiskScore
);

console.log(
    "Total Position Size: ",
    report.totalPositionSize
);

console.log(
    "\nExecution Environment"
);

console.log(
    "Chain ID:            ",
    report.chainId
);

console.log(
    "Contract Address:    ",
    report.contractAddress
);

console.log(
    "Dry Run:             ",
    report.dryRun
);

if (report.latestDecision) {
    console.log(
        "\nLatest Decision"
    );

    console.log(
        "Asset:               ",
        report.latestDecision.asset
    );

    console.log(
        "Current Price:       ",
        report.latestDecision.currentPrice
    );

    console.log(
        "Entry Price:         ",
        report.latestDecision.entryPrice
    );

    console.log(
        "AI Signal:           ",
        report.latestDecision.aiSignal
    );

    console.log(
        "Final Signal:        ",
        report.latestDecision.finalSignal
    );

    console.log(
        "Risk Score:          ",
        report.latestDecision.riskScore
    );

    console.log(
        "Position Size:       ",
        report.latestDecision.positionSize
    );

    console.log(
        "Reason:              ",
        report.latestDecision.decisionReason
    );
}

console.log(
    "\n========================================\n"
);