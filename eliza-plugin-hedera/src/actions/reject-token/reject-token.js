"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectTokenAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const schema_ts_1 = require("./schema.ts");
const reject_token_action_service_ts_1 = require("./service/reject-token-action-service.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const templates_1 = require("../../templates");
exports.rejectTokenAction = {
    name: "HEDERA_REJECT_TOKEN",
    description: "Action for rejecting HTS token airdropped to an account",
    handler: async (runtime, _message, state, _options, _callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaRejectTokenContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.rejectTokenTemplate,
            templatingEngine: "handlebars",
        });
        const hederaRejectTokenContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaRejectTokenContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            tokenId: hederaRejectTokenContent.tokenId,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaRejectTokenParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                throw new Error(`Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new reject_token_action_service_ts_1.RejectTokenActionService(hederaProvider);
            const response = await action.execute(paramOptions);
            if (_callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await _callback({
                    text: `Successfully rejected token: ${paramOptions.tokenId}.\nTransaction link: ${url}`,
                    content: {
                        success: true,
                        tokenId: paramOptions.tokenId,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error(`Error rejecting token: ${paramOptions.tokenId}.`, error);
            if (_callback) {
                await _callback({
                    text: `Error rejecting token ${paramOptions.tokenId}.\nError: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.rejectTokenTemplate,
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
                    text: "Reject token {{0.0.5424086}}.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I don't want to accept the token {{0.0.542086}} from airdrop. Reject it.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Remove airdropped token {{0.0.654321}} from my account.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I do not wish to receive token {{0.0.112233}}. Reject it immediately.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
    ],
    similes: ["HEDERA_REJECT_AIRDROP", "HEDERA_REJECT_HTS", "REJECT_HTS"],
};
