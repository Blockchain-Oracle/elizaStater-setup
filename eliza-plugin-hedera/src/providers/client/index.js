"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaClientProvider = exports.initAgentKit = exports.HederaProvider = void 0;
const sdk_1 = require("@hashgraph/sdk");
const hedera_agent_kit_1 = require("hedera-agent-kit");
class HederaProvider {
    constructor(_runtime) {
        this.agentKit = (0, exports.initAgentKit)(_runtime);
    }
    getHederaAgentKit() {
        return this.agentKit;
    }
}
exports.HederaProvider = HederaProvider;
const initAgentKit = (_runtime) => {
    const accountID = _runtime.getSetting("HEDERA_ACCOUNT_ID");
    const privateKeyString = _runtime.getSetting("HEDERA_PRIVATE_KEY");
    const privateKeyType = _runtime.getSetting("HEDERA_KEY_TYPE");
    const publicKey = _runtime.getSetting("HEDERA_PUBLIC_KEY");
    const networkType = _runtime.getSetting("HEDERA_NETWORK_TYPE");
    const hederaPrivateKey = hederaPrivateKeyFromString({
        key: privateKeyString,
        keyType: privateKeyType,
    });
    let hederaAgentKit;
    try {
        hederaAgentKit = new hedera_agent_kit_1.HederaAgentKit(accountID, hederaPrivateKey.privateKey.toStringDer(), publicKey, networkType);
    }
    catch (error) {
        console.error("Error initialising HederaAgentKit: ", error);
    }
    return hederaAgentKit;
};
exports.initAgentKit = initAgentKit;
const hederaPrivateKeyFromString = ({ key, keyType, }) => {
    let privateKey;
    try {
        if (keyType === "ECDSA") {
            privateKey = sdk_1.PrivateKey.fromStringECDSA(key); // works with both 'HEX Encoded Private Key' and 'DER Encoded Private Key' for ECDSA
        }
        else if (keyType === "ED25519") {
            privateKey = sdk_1.PrivateKey.fromStringED25519(key); // works with both 'HEX Encoded Private Key' and 'DER Encoded Private Key' for ED25519
        }
        else {
            throw new Error("Unsupported key type. Must be 'ECDSA' or 'ED25519'.");
        }
    }
    catch (error) {
        throw new Error(`Invalid private key or key type: ${error.message}`);
    }
    return { privateKey, type: keyType };
};
exports.hederaClientProvider = {
    async get(runtime, _message, state) {
        try {
            const hederaProvider = new HederaProvider(runtime);
            const hederaAgentKit = hederaProvider.getHederaAgentKit();
            const balance = await hederaAgentKit.getHbarBalance();
            const agentName = state?.agentName || "The agent";
            const address = runtime.getSetting("HEDERA_ACCOUNT_ID");
            return `${agentName}'s Hedera Wallet Address: ${address}\nBalance: ${balance} HBAR\n`;
        }
        catch (error) {
            console.error("Error in Hedera client provider:", error);
            return null;
        }
    },
};
