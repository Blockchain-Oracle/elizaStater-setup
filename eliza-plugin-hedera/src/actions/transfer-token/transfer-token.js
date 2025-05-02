"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferTokenAction = void 0;
const core_1 = require("@elizaos/core");
const templates_1 = require("../../templates");
const transfer_token_ts_1 = require("./services/transfer-token.ts");
const schema_ts_1 = require("./schema.ts");
const client_1 = require("../../providers/client");
const utils_ts_1 = require("../../shared/utils.ts");
exports.transferTokenAction = {
    name: "TRANSFER_TOKEN",
    description: "Transfer token using provided tokenId between addresses on the same chain",
    handler: async (runtime, message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const hederaTokenTransferContext = (0, core_1.composeContext)({
                state: state,
                template: templates_1.hederaTransferTokenTemplate,
                templatingEngine: "handlebars",
            });
            const hederaTokenTransferContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: hederaTokenTransferContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            const hederaTokenTransferData = schema_ts_1.transferTokenParamsSchema.parse(hederaTokenTransferContent);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new transfer_token_ts_1.TransferTokenService(hederaProvider);
            const response = await action.execute(hederaTokenTransferData, networkType);
            if (callback && response.status === "SUCCESS") {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Transfer of token ${hederaTokenTransferData.tokenId} to ${hederaTokenTransferData.toAccountId} completed.\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during token transfer:", error);
            await callback({
                text: `Error during token transfer: ${error.message}`,
                content: { error: error.message },
            });
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
                user: "assistant",
                content: {
                    text: "I'll help you transfer 3.10 tokens 0.0.5425085 to 0.0.4515512",
                    action: "TRANSFER_TOKEN",
                },
            },
            {
                user: "user",
                content: {
                    text: "Make transfer 3.10 of tokens 0.0.5425085 to account 0.0.4515512",
                    action: "TRANSFER_TOKEN",
                },
            },
        ],
    ],
    similes: ["SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"],
};
