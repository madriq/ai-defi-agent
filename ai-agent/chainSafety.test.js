const assert =
    require("assert");

const { ethers } =
    require("ethers");

// ========================================
// STAGE 10 — LOCAL CHAIN SAFETY TEST
// ========================================

const REQUIRED_CHAIN_ID =
    31337n;

// ========================================
// SAFETY FUNCTION
// ========================================

function verifyChainId(
    chainId
) {

    if (
        chainId !== REQUIRED_CHAIN_ID
    ) {
        throw new Error(
            `SAFETY LOCK: Refusing execution on chain ${chainId.toString()}. Expected local Hardhat chain ${REQUIRED_CHAIN_ID.toString()}.`
        );
    }

    return true;
}

// ========================================
// TEST HELPER
// ========================================

function test(
    name,
    fn
) {

    try {

        fn();

        console.log(
            `✔ ${name}`
        );

    } catch (error) {

        console.error(
            `✘ ${name}`
        );

        throw error;
    }
}

// ========================================
// TEST 1 — HARDHAT CHAIN
// ========================================

test(
    "Hardhat chain 31337 is accepted",
    () => {

        const result =
            verifyChainId(
                31337n
            );

        assert.strictEqual(
            result,
            true
        );
    }
);

// ========================================
// TEST 2 — EXTERNAL CHAIN REJECTED
// ========================================

test(
    "Non-local chain is rejected",
    () => {

        assert.throws(
            () => {
                verifyChainId(
                    1n
                );
            },
            /SAFETY LOCK/
        );
    }
);

// ========================================
// TEST 3 — ANOTHER CHAIN REJECTED
// ========================================

test(
    "Another non-local chain is rejected",
    () => {

        assert.throws(
            () => {
                verifyChainId(
                    56n
                );
            },
            /SAFETY LOCK/
        );
    }
);

// ========================================
// TEST 4 — CHAIN ID TYPE
// ========================================

test(
    "Chain ID is handled as bigint",
    () => {

        const chainId =
            31337n;

        assert.strictEqual(
            typeof chainId,
            "bigint"
        );

        assert.strictEqual(
            chainId,
            REQUIRED_CHAIN_ID
        );
    }
);

// ========================================
// COMPLETE
// ========================================

console.log(
    "\nStage 10B local chain safety tests passed."
);