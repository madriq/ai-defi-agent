 const RPC_URL = "http://127.0.0.1:8545";

const CONTRACT_ADDRESS =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const PRIVATE_KEY =
    process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    throw new Error(
        "PRIVATE_KEY is not configured. Set it in .env for local testing."
    );
}

module.exports = {
    RPC_URL,
    CONTRACT_ADDRESS,
    PRIVATE_KEY
};