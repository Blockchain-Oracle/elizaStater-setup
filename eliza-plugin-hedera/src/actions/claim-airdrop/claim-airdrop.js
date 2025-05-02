"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimAirdropAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const templates_1 = require("../../templates");
const schema_ts_1 = require("./schema.ts");
const claim_airdrop_service_ts_1 = require("./services/claim-airdrop-service.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const constants_ts_1 = require("../../shared/constants.ts");
exports.claimAirdropAction = {
    name: "HEDERA_CLAIM_AIRDROP",
    description: "Claim available pending token airdrop",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const claimAirdropContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.claimAirdropTemplate,
            templatingEngine: "handlebars",
        });
        const claimAirdropContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: claimAirdropContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        try {
            const claimAirdropData = schema_ts_1.claimAirdropParamsSchema.parse(claimAirdropContent);
            console.log(`Extracted data: ${JSON.stringify(claimAirdropData, null, 2)}`);
            const accountId = runtime.getSetting("HEDERA_ACCOUNT_ID");
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new claim_airdrop_service_ts_1.ClaimAirdropService(hederaProvider);
            const response = await action.execute(claimAirdropData, accountId);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Successfully claimed airdrop for token ${claimAirdropData.tokenId}.\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during claiming airdrop:", error);
            if (callback) {
                await callback({
                    text: `Error during claiming airdrop: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    validate: async (runtime) => {
        const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
        const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
        const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
        return !!(privateKey && accountAddress && selectedNetworkType);
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Claim airdrop (1) 5 Tokens ({{0.0.5445766}}) from {{0.0.5393076}}",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Claim airdrop (2) 50 Tokens ({{0.0.5447843}}) from {{0.0.5393076}}",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
        ],
    ],
    similes: ["CLAIM_AIRDROP", "CLAIM_TOKEN_AIRDROP", "CLAIM_TOKEN"],
};
