"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenHoldersActionService = void 0;
const hedera_agent_kit_1 = require("hedera-agent-kit");
const constants_ts_1 = require("../../../shared/constants.ts");
const utils_ts_1 = require("../../../shared/utils.ts");
class TokenHoldersActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        if (!params.tokenId) {
            throw new Error("No token id provided!");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const thresholdBaseUnit = params.threshold
            ? await (0, hedera_agent_kit_1.toBaseUnit)(params.tokenId, params.threshold, networkType).then((num) => num.toNumber())
            : undefined;
        const balancesArray = await agentKit.getTokenHolders(params.tokenId, networkType, thresholdBaseUnit);
        const formattedBalances = balancesArray.map(({ account, balance, decimals }) => ({
            account,
            balance: (0, utils_ts_1.toBaseUnitSync)(decimals, balance).toString(),
            decimals,
        }));
        const tokenDetails = await agentKit.getHtsTokenDetails(params.tokenId, networkType);
        return {
            status: constants_ts_1.TxStatus.SUCCESS,
            tokenId: params.tokenId,
            tokenName: tokenDetails.name,
            tokenSymbol: tokenDetails.symbol,
            tokenDecimals: Number(tokenDetails.decimals),
            holdersArray: formattedBalances,
        };
    }
}
exports.TokenHoldersActionService = TokenHoldersActionService;
