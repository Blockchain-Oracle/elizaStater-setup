"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateTokenAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const schema_ts_1 = require("./schema.ts");
const associate_token_action_service_ts_1 = require("./service/associate-token-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const templates_1 = require("../../templates");
exports.associateTokenAction = {
    name: "HEDERA_ASSOCIATE_TOKEN",
    description: "Associates provided token with given account",
    handler: async (runtime, _message, state, _options, _callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaAssociateTokenContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.associateTokenTemplate,
            templatingEngine: "handlebars",
        });
        const hederaAssociateTokenContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaAssociateTokenContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            tokenId: hederaAssociateTokenContent.tokenId,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaAssociateTokenParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                throw new Error(`Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new associate_token_action_service_ts_1.AssociateTokenActionService(hederaProvider);
            const response = await action.execute(paramOptions);
            if (_callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await _callback({
                    text: `Token ${paramOptions.tokenId} has been associated with the account.\nTransaction link: ${url}`,
                    content: {
                        success: true,
                        tokenId: paramOptions.tokenId,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error(`Error during associating token ${paramOptions.tokenId}:`, error);
            if (_callback) {
                await _callback({
                    text: `Error during associating token ${paramOptions.tokenId}: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.associateTokenTemplate,
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
                    text: "Associate my wallet with token {{0.0.123456}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                    tokenId: "0.0.123456",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you link my wallet to token {{0.0.654321}}?",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to associate my wallet with token {{0.0.987654}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please associate my account with token {{0.0.111222}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Connect my wallet to token {{0.0.333444}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Could you link token {{0.0.555666}} to my wallet?",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Attach token {{0.0.777888}} to my wallet.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Make my wallet associated with token {{0.0.999000}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I’d like to link token {{0.0.112233}} with my wallet.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me associate token {{0.0.445566}} to my wallet.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
    ],
    similes: ["HEDERA_ASSOCIATE_HTS"],
};
