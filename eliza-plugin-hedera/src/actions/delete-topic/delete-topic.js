"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopicAction = void 0;
const core_1 = require("@elizaos/core");
const templates_1 = require("../../templates");
const client_1 = require("../../providers/client");
const schema_ts_1 = require("./schema.ts");
const delete_topic_ts_1 = require("./services/delete-topic.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
exports.deleteTopicAction = {
    name: "HEDERA_DELETE_TOPIC",
    description: "Delete topic with hedera consensus service.",
    handler: async (runtime, _message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const deleteTopicContext = (0, core_1.composeContext)({
                state,
                template: templates_1.hederaDeleteTopicTemplate,
                templatingEngine: "handlebars",
            });
            const deleteTopicContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: deleteTopicContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            const deleteTopicData = schema_ts_1.deleteTopicParamsSchema.parse(deleteTopicContent);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new delete_topic_ts_1.DeleteTopicService(hederaProvider);
            const response = await action.execute(deleteTopicData);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Successfully deleted topic ${deleteTopicData.topicId}.\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during topic deletion:", error);
            await callback({
                text: `Error during topic deletion: ${error.message}`,
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
                    text: "I'll help you delete topic: {{0.0.5464449}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
            {
                user: "user",
                content: {
                    text: "Delete topic with id {{0.0.5464449}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
        ],
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you delete topic: {{0.0.5464185}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
            {
                user: "user",
                content: {
                    text: "Delete topic with id {{0.0.5464185}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
        ],
    ],
    similes: ["DELETE_TOPIC", "REMOVE_TOPIC", "HEDERA_REMOVE_TOPIC"],
};
