"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dissociateTokenAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const dissociate_token_action_service_ts_1 = require("./service/dissociate-token-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const schema_ts_1 = require("./schema.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const templates_1 = require("../../templates");
exports.dissociateTokenAction = {
    name: "HEDERA_DISSOCIATE_TOKEN",
    description: "Dissociates provided token with given account",
    handler: async (runtime, _message, state, _options, _callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaDissociateTokenContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.dissociateTokenTemplate,
            templatingEngine: "handlebars",
        });
        const hederaDissociateTokenContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaDissociateTokenContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            tokenId: hederaDissociateTokenContent.tokenId,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaDissociateTokenParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                throw new Error(`Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new dissociate_token_action_service_ts_1.DissociateTokenActionService(hederaProvider);
            const response = await action.execute(paramOptions);
            if (_callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await _callback({
                    text: `Token ${paramOptions.tokenId} has been dissociated from account.\nTransaction link: ${url}`,
                    content: {
                        success: true,
                        tokenId: paramOptions.tokenId,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error(`Error during dissociating token ${paramOptions.tokenId}:`, error);
            if (_callback) {
                await _callback({
                    text: `Error during dissociating token ${paramOptions.tokenId}: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.dissociateTokenTemplate,
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
                    text: "Disassociate my wallet from token {{0.0.123456}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                    tokenId: "0.0.123456",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you unlink my wallet from token {{0.0.654321}}?",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to remove my wallet’s association with token {{0.0.987654}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please remove my account’s link to token {{0.0.111222}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Disconnect my wallet from token {{0.0.333444}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Could you remove token {{0.0.555666}} from my wallet?",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Detach token {{0.0.777888}} from my wallet.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Make my wallet no longer associated with token {{0.0.999000}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I’d like to unlink token {{0.0.112233}} from my wallet.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me disassociate token {{0.0.445566}} from my wallet.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
    ],
    similes: ["HEDERA_DISSOCIATE_HTS", "HEDERA_UNLINK_TOKEN"],
};
