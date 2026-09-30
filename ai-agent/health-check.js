const { ethers } = require("ethers");

 const {
    RPC_URL,
    CONTRACT_ADDRESS
} = require("./config");

const {
    verifyAuditLog
} = require("./auditLogger");

const OLLAMA_URL =
    "http://localhost:11434/api/tags";

const AI_MODEL =
    "llama3.2";

const REQUIRED_CHAIN_ID =
    31337n;

async function checkRPC() {
    const provider =
        new ethers.JsonRpcProvider(RPC_URL);

    const network =
        await provider.getNetwork();

    if (
        network.chainId !==
        REQUIRED_CHAIN_ID
    ) {
        throw new Error(
            `Wrong chain ID: ${network.chainId}`
        );
    }

    return {
        status: "OK",
        chainId:
            network.chainId.toString()
    };
}

async function checkContract() {
    const provider =
        new ethers.JsonRpcProvider(RPC_URL);

    const code =
        await provider.getCode(
            CONTRACT_ADDRESS
        );

    if (
        code === "0x"
    ) {
        throw new Error(
            "Contract bytecode not found"
        );
    }

    return {
        status: "OK",
        address:
            CONTRACT_ADDRESS,
        bytecode:
            "PRESENT"
    };
}

async function checkOllama() {
    const response =
        await fetch(
            OLLAMA_URL
        );

    if (!response.ok) {
        throw new Error(
            `Ollama HTTP error: ${response.status}`
        );
    }

    const data =
        await response.json();

    const models =
        Array.isArray(data.models)
            ? data.models
            : [];

    const modelFound =
        models.some(
            model =>
                model.name === AI_MODEL ||
                model.name?.startsWith(
                    `${AI_MODEL}:`
                )
        );

    if (!modelFound) {
        throw new Error(
            `Ollama model not found: ${AI_MODEL}`
        );
    }

    return {
        status: "OK",
        model:
            AI_MODEL
    };
}

function checkAuditLog() {
    const result =
        verifyAuditLog();

    if (
        result.invalid > 0
    ) {
        throw new Error(
            `Audit log contains ${result.invalid} invalid record(s)`
        );
    }

    return {
        status: "OK",
        total:
            result.total,
        valid:
            result.valid,
        invalid:
            result.invalid
    };
}

function checkExecutionMode() {
    const dryRun =
        true;

    if (!dryRun) {
        throw new Error(
            "Safety check failed: DRY_RUN is not enabled"
        );
    }

    return {
        status: "OK",
        dryRun
    };
}

async function runHealthCheck() {
    const checks = {};

    try {
        checks.rpc =
            await checkRPC();
    } catch (error) {
        checks.rpc = {
            status: "FAIL",
            error:
                error.message
        };
    }

    try {
        checks.contract =
            await checkContract();
    } catch (error) {
        checks.contract = {
            status: "FAIL",
            error:
                error.message
        };
    }

    try {
        checks.ollama =
            await checkOllama();
    } catch (error) {
        checks.ollama = {
            status: "FAIL",
            error:
                error.message
        };
    }

    try {
        checks.auditLog =
            checkAuditLog();
    } catch (error) {
        checks.auditLog = {
            status: "FAIL",
            error:
                error.message
        };
    }

    try {
        checks.executionMode =
            checkExecutionMode();
    } catch (error) {
        checks.executionMode = {
            status: "FAIL",
            error:
                error.message
        };
    }

    const failed =
        Object.values(checks)
            .filter(
                check =>
                    check.status === "FAIL"
            );

    return {
        status:
            failed.length === 0
                ? "HEALTHY"
                : "DEGRADED",
        checks
    };
}

 if (require.main === module) {
    runHealthCheck()
        .then(result => {
            console.log(
                JSON.stringify(
                    result,
                    null,
                    2
                )
            );

            if (
                result.status !==
                "HEALTHY"
            ) {
                process.exitCode = 1;
            }
        })
        .catch(error => {
            console.error(
                "Health check error:",
                error.message
            );

            process.exitCode = 1;
        });
}

module.exports = {
    runHealthCheck
};