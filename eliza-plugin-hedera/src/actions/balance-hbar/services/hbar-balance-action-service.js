"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HbarBalanceActionService = void 0;
const constants_ts_1 = require("../../../shared/constants.ts");
class HbarBalanceActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.address) {
            throw new Error("No receiver address");
        }
        if (!params.symbol) {
            throw new Error("No symbol");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const balance = await agentKit.getHbarBalance(params.address);
        return {
            status: constants_ts_1.TxStatus.SUCCESS,
            balance: balance,
            unit: "HBAR",
        };
    }
}
exports.HbarBalanceActionService = HbarBalanceActionService;
