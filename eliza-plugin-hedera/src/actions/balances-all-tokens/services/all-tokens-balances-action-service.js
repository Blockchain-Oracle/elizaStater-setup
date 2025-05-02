"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllTokensBalancesActionService = void 0;
const constants_ts_1 = require("../../../shared/constants.ts");
class AllTokensBalancesActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        if (!params.address) {
            throw new Error("No receiver address");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const balancesArray = await agentKit.getAllTokensBalances(networkType, params.address);
        return {
            status: constants_ts_1.TxStatus.SUCCESS,
            balancesArray: balancesArray,
        };
    }
}
exports.AllTokensBalancesActionService = AllTokensBalancesActionService;
