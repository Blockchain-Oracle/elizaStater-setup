"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSpendingApprovalAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const schema_ts_1 = require("./schema.ts");
const set_spending_approval_action_service_ts_1 = require("./services/set-spending-approval-action-service.ts");
const templates_1 = require("../../templates");
exports.setSpendingApprovalAction = {
    name: "HEDERA_SET_SPENDING_APPROVAL",
    description: "Action for setting spending approval for HBAR or fungible tokens",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaGetTopicMessagesContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.getSpendingAllowanceTemplate,
            templatingEngine: "handlebars",
        });
        const hederaSetSpedingApprovalContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaGetTopicMessagesContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            spenderAccountId: hederaSetSpedingApprovalContent.spenderAccountId,
            amount: hederaSetSpedingApprovalContent.amount,
            tokenId: hederaSetSpedingApprovalContent.tokenId,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaSetSpendingApprovalParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map((e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`);
                throw new Error(`Error during parsing data from users prompt: ${errorMessages.join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new set_spending_approval_action_service_ts_1.SetSpendingApprovalTokenAction(hederaProvider);
            const response = await action.execute(paramOptions, networkType);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                const token = paramOptions.tokenId ? paramOptions.tokenId : "HBAR";
                await callback({
                    text: `Successfully set the spending approval of ${paramOptions.amount} of tokens ${token} for the account ${paramOptions.spenderAccountId}.\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error setting the spending approval. Error:", error);
            if (callback) {
                await callback({
                    text: `Error setting the spending approval. Error: ${error.message}`,
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
                    text: "Set spending approval for an account {{0.0.123456}} for 123 HBAR.",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Set spending approval for an account {{0.0.123456}} for 123 tokens {{0.0.2222222}}.",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Set spending approval of 123 tokens {{0.0.2222222}} for an account {{0.0.123456}}.",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_SET_SPENDING_APPROVAL_HBAR",
        "HEDERA_SET_SPENDING_APPROVAL_HTS",
    ],
};
