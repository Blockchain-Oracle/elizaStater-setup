"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferAction = void 0;
const core_1 = require("@elizaos/core");
const templates_1 = require("../../templates");
const client_1 = require("../../providers/client");
const transfer_hbar_ts_1 = require("./services/transfer-hbar.ts");
const schema_ts_1 = require("./schema.ts");
const utils_ts_1 = require("../../shared/utils.ts");
exports.transferAction = {
    name: "TRANSFER_HBAR",
    description: "Transfer HBAR between addresses on the same chain",
    handler: async (runtime, _message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const hederaTransferContext = (0, core_1.composeContext)({
                state: state,
                template: templates_1.hederaHBARTransferTemplate,
                templatingEngine: "handlebars",
            });
            const hederaTransferContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: hederaTransferContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            console.log(`Extracted data: ${JSON.stringify(hederaTransferContent, null, 2)}`);
            const hederaTransferData = schema_ts_1.transferDataParamsSchema.parse(hederaTransferContent);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const transferHbarService = new transfer_hbar_ts_1.TransferHbarService(hederaProvider);
            const response = await transferHbarService.execute(hederaTransferData);
            if (callback && response.status === "SUCCESS") {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Transfer of ${hederaTransferData.amount} HBAR to ${hederaTransferData.accountId} completed.\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during HBAR transfer:", error);
            await callback({
                text: `Error during HBAR transfer: ${error.message}`,
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
                user: "{{user}}",
                content: {
                    text: "Transfer {{1}} HBAR to {{0.0.4515512}}",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Send {{10.5}} HBAR to account {{0.0.987654}}.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Move {{0.75}} HBAR to {{0.0.1234567}} now.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "I want to transfer {{5}} HBAR to {{0.0.7654321}}.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Can you send {{3.25}} HBAR to {{0.0.5555555}}?",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Transfer exactly {{8.8}} HBAR to {{0.0.9999999}}.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Make a transaction of {{15}} HBAR to {{0.0.6666666}}.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Please transfer {{2}} HBAR to {{0.0.3333333}} ASAP.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Move {{12.5}} HBAR from my wallet to {{0.0.2222222}}.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Send exactly {{50}} HBAR to {{0.0.7777777}}, please.",
                    action: "TRANSFER_HBAR",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "TRANSFER_HBAR",
                },
            },
        ],
    ],
    similes: ["SEND_HBAR", "HBAR_TRANSFER", "MOVE_HBAR"],
};
