"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTokenService = void 0;
class CreateTokenService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.name) {
            throw new Error("Missing name of token");
        }
        if (!params.symbol) {
            throw new Error("Missing symbol of token");
        }
        if (typeof params.decimals !== 'number') {
            throw new Error("Missing decimals of token");
        }
        if (typeof params.initialSupply !== 'number') {
            throw new Error("Missing initial supply of token");
        }
        // not setting supply key by default
        if (params.isSupplyKey == null) {
            params.isSupplyKey = false;
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const initialSupplyBaseUnit = params.initialSupply * 10 ** params.decimals;
        const options = {
            symbol: params.symbol,
            name: params.name,
            decimals: params.decimals,
            initialSupply: initialSupplyBaseUnit,
            isSupplyKey: params.isSupplyKey,
            isMetadataKey: params.isMetadataKey,
            isAdminKey: params.isAdminKey,
            tokenMetadata: new TextEncoder().encode(params.tokenMetadata),
            memo: params.memo,
        };
        return agentKit.createFT(options);
    }
}
exports.CreateTokenService = CreateTokenService;
