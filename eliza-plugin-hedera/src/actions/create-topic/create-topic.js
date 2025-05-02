"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopicAction = void 0;
const core_1 = require("@elizaos/core");
const templates_1 = require("../../templates");
const schema_ts_1 = require("./schema.ts");
const client_1 = require("../../providers/client");
const create_topic_ts_1 = require("./services/create-topic.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
exports.createTopicAction = {
    name: "HEDERA_CREATE_TOPIC",
    description: "Create topic with hedera consensus service for messaging.",
    handler: async (runtime, _message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const createTopicContext = (0, core_1.composeContext)({
                state,
                template: templates_1.hederaCreateTopicTemplate,
                templatingEngine: "handlebars",
            });
            const createTopicContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: createTopicContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            console.log(`Extracted data: ${JSON.stringify(createTopicContent, null, 2)}`);
            const createTopicData = schema_ts_1.createTopicParamsSchema.parse(createTopicContent);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new create_topic_ts_1.CreateTopicService(hederaProvider);
            const response = await action.execute(createTopicData);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Successfully created topic: ${response.topicId}.\nTransaction link: ${url}\n`,
                    content: {
                        success: true,
                        topicId: response.topicId,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during topic creation:", error);
            await callback({
                text: `Error during topic creation: ${error.message}`,
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
                user: "user",
                content: {
                    text: "Create a new topic with memo 'blockchain logs'",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: blockchain logs",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create for me a new topic with memo 'NFT transactions'",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: NFT transactions",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create a new topic with memo 'DeFi logs'. Use a submit key.",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: DeFi logs and submit key enabled",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create a new topic with memo 'security alerts'. Restrict posting with a key.",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: security alerts and submit key enabled",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create a topic with memo 'open discussion'. Let everyone post.",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: open discussion",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
    ],
    similes: ["CREATE_TOPIC", "NEW_TOPIC", "HEDERA_NEW_TOPIC"],
};
