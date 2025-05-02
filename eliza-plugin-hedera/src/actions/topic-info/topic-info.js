"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicInfoAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const topic_info_action_service_ts_1 = require("./services/topic-info-action-service.ts");
const schema_ts_1 = require("./schema.ts");
const templates_1 = require("../../templates");
exports.topicInfoAction = {
    name: "HEDERA_TOPIC_INFO",
    description: "Returns details of given topic by its topic ID",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaTopicInfoContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.topicInfoTemplate,
            templatingEngine: "handlebars",
        });
        const hederaTopicInfoContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaTopicInfoContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            topicId: hederaTopicInfoContent.topicId,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaTopicInfoParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map((e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`);
                throw new Error(`Error during fetching topic info: ${errorMessages.join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new topic_info_action_service_ts_1.TopicInfoActionService(hederaProvider);
            const result = await action.execute(paramOptions, networkType);
            if (callback && result !== "") {
                const url = `https://hashscan.io/${networkType}/topic/${paramOptions.topicId}`;
                await callback({
                    text: `Topic info for topic with id ${paramOptions.topicId}:\n${result}\nLink: ${url}`,
                    content: {
                        success: true,
                        topicInfo: result,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during fetching topic info: ", error);
            if (callback) {
                await callback({
                    text: `Error during fetching topic info: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.topicInfoTemplate,
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
                    text: "Give me the info for topic {{0.0.12345}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Give me the details about topic {{0.0.12345}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'd like to see the status of topic {{0.0.67890}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Fetch topic details for {{0.0.112233}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What can you tell me about topic {{0.0.445566}}?",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Retrieve details of topic {{0.0.778899}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you provide information on topic {{0.0.556677}}?",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'd like to get details on topic {{0.0.998877}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
    ],
    similes: [
        "HCS_TOPIC_INFO",
        "HEDERA_HCS_INFO",
        "HEDERA_TOPIC_DETAILS",
        "HCS_TOPIC_DETAILS",
    ],
};
