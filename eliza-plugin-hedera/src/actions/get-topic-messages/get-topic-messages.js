"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicMessagesAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const schema_ts_1 = require("./schema.ts");
const get_topic_messages_action_service_ts_1 = require("./services/get-topic-messages-action-service.ts");
const templates_1 = require("../../templates");
exports.getTopicMessagesAction = {
    name: "HEDERA_GET_TOPIC_MESSAGES",
    description: "Action for fetching messages from a topic by its ID, with the option to filter messages by upper and lower thresholds.",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaGetTopicMessagesContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.getTopicMessagesTemplate,
            templatingEngine: "handlebars",
        });
        const hederaGetTopicMessagesContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaGetTopicMessagesContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            topicId: hederaGetTopicMessagesContent.topicId,
            lowerThreshold: hederaGetTopicMessagesContent.lowerThreshold,
            upperThreshold: hederaGetTopicMessagesContent.upperThreshold,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaGetTopicMessagesParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map((e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`);
                throw new Error(`Error during parsing data from users prompt: ${errorMessages.join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new get_topic_messages_action_service_ts_1.GetTopicMessageActionService(hederaProvider);
            const response = await action.execute(validationResult.data, networkType);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                let formatedText = "";
                if (response.messages.length == 0) {
                    formatedText = "No messages found.";
                }
                else {
                    response.messages.forEach((hcsMessage) => {
                        formatedText += `-----------------------\nAuthor: ${hcsMessage.payer_account_id}\nBody: ${hcsMessage.message}\nTimestamp: ${(0, utils_ts_1.convertTimestampToUTC)(hcsMessage.consensus_timestamp)}\n`;
                    });
                }
                const dateRangeText = `between ${validationResult.data.lowerThreshold ? validationResult.data.lowerThreshold : "topic creation"} and ${validationResult.data.upperThreshold ? validationResult.data.upperThreshold : "this moment"}`;
                await callback({
                    text: `Messages for topic ${paramOptions.topicId} posted ${dateRangeText}:\n${formatedText}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error fetching messages. Error:", error);
            if (callback) {
                await callback({
                    text: `Error fetching messages. Error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.getTopicMessagesTemplate,
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
                    text: "Get messages from a topic {{0.0.123456}}.",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Show me all messages from a topic {{0.0.123456}}, that have been posted since {{05.02.2025 14:14:14:144}}.",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Show me all messages from a topic {{0.0.123456}}, that have been posted between {{05.02.2025 14:14:14:144}} and {{08.02.2025 20:14:20:144}}.",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_GET_TOPIC_MESSAGES",
        "HEDERA_GET_HCS_MESSAGES",
        "HCS_FETCH_MESSAGES",
    ],
};
