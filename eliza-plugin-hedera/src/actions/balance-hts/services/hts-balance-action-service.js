"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtsBalanceActionService = void 0;
const hedera_agent_kit_1 = require("hedera-agent-kit");
const constants_ts_1 = require("../../../shared/constants.ts");
class HtsBalanceActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const balance = await agentKit.getHtsBalance(params.tokenId, networkType, params.address);
        const tokenDetails = await agentKit.getHtsTokenDetails(params.tokenId, networkType);
        return {
            status: constants_ts_1.TxStatus.SUCCESS,
            balance: await (0, hedera_agent_kit_1.toDisplayUnit)(params.tokenId, balance, networkType).then((b) => b.toString()),
            unit: tokenDetails.name,
            symbol: tokenDetails.symbol,
        };
    }
}
exports.HtsBalanceActionService = HtsBalanceActionService;
