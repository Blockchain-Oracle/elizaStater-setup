"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTopicMessageAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const submit_topic_message_action_service_ts_1 = require("./services/submit-topic-message-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const schema_ts_1 = require("./schema.ts");
const templates_1 = require("../../templates");
exports.submitTopicMessageAction = {
    name: "HEDERA_SUBMIT_TOPIC_MESSAGE",
    description: "Submits message to a topic given by its id",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaSubmitTopicMessageContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.submitTopicMessageTemplate,
            templatingEngine: "handlebars",
        });
        const hederaSubmitTopicMessageContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaSubmitTopicMessageContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            topicId: hederaSubmitTopicMessageContent.topicId,
            message: hederaSubmitTopicMessageContent.message,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaSubmitTopicMessageParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map((e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`);
                throw new Error(`Error during parsing data from users prompt: ${errorMessages.join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new submit_topic_message_action_service_ts_1.SubmitTopicMessageActionService(hederaProvider);
            const response = await action.execute(paramOptions);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Successfully submitted message to topic: ${paramOptions.topicId}\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during submitting message. You might not have the submitting privileges for this topic. Error:", error);
            if (callback) {
                await callback({
                    text: `Error during submitting message. You might not have the submitting privileges for this topic. Error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.submitTopicMessageTemplate,
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
                    text: "Submit message: 'hello world' to topic 0.0.123456.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'hello world' to topic 0.0.123456.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Submit message 'Hedera is great!' to topic 0.0.654321.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'Hedera is great!' to topic 0.0.654321.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "I want to post to topic 0.0.987654. Message: Smart contracts update.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'Smart contracts update' to topic 0.0.987654.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Send 'DeFi price feed update' to topic 0.0.456789.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'DeFi price feed update' to topic 0.0.456789.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Post 'Security alert: suspicious activity' to topic 0.0.112233.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'Security alert: suspicious activity' to topic 0.0.112233.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
    ],
    similes: ["HEDERA_NEW_MESSAGE", "HCS_MESSAGE", "HCS_TOPIC_SUBMIT_MESSAGE"],
};
