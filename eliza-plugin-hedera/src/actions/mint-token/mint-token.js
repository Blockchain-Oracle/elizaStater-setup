"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintTokenAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const mint_token_action_service_ts_1 = require("./services/mint-token-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const schema_ts_1 = require("./schema.ts");
const templates_1 = require("../../templates");
exports.mintTokenAction = {
    name: "HEDERA_MINT_TOKEN",
    description: "Action allowing minting fungible tokens",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaMintTokenContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.mintTokenTemplate,
            templatingEngine: "handlebars",
        });
        const hederaMintTokenContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaMintTokenContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            tokenId: hederaMintTokenContent.tokenId,
            amount: hederaMintTokenContent.amount,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaMintTokenParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map((e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`);
                throw new Error(`Error during parsing data from users prompt: ${errorMessages.join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new mint_token_action_service_ts_1.MintTokenActionService(hederaProvider);
            const response = await action.execute(paramOptions, networkType);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Successfully minted ${paramOptions.amount} of tokens ${paramOptions.tokenId}\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during minting tokens. Error:", error);
            if (callback) {
                await callback({
                    text: `Error during minting tokens. Error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.mintTokenTemplate,
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
                    text: "Mint 2500 tokens 0.0.999888",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Generate 150 tokens 0.0.567123",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create and distribute 4000 tokens with id 0.0.333222",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Mint exactly 999 tokens 0.0.741852",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "HEDERA_MINT_TOKEN: Issue 5000 tokens 0.0.852963",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_MINT_TOKEN_ACTION",
        "HEDERA_MINT_FUNGIBLE_TOKEN",
        "HCS_MINT_TOKEN",
    ],
};
