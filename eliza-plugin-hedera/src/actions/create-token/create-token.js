"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenAction = void 0;
const core_1 = require("@elizaos/core");
const templates_1 = require("../../templates");
const client_1 = require("../../providers/client");
const create_token_ts_1 = require("./services/create-token.ts");
const schema_ts_1 = require("./schema.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_2 = require("./utils.ts");
exports.createTokenAction = {
    name: "HEDERA_CREATE_TOKEN",
    description: "Create a new fungible token on the Hedera network",
    handler: async (runtime, _message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const hederaCreateTokenContext = (0, core_1.composeContext)({
                state: state,
                template: templates_1.hederaCreateTokenTemplate,
                templatingEngine: "handlebars",
            });
            const hederaCreateTokenContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: hederaCreateTokenContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            const createTokenData = schema_ts_1.createTokenParamsSchema.parse(hederaCreateTokenContent);
            console.log(`Extracted data: ${JSON.stringify(createTokenData, null, 2)}`);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const createTokenService = new create_token_ts_1.CreateTokenService(hederaProvider);
            const response = await createTokenService.execute(createTokenData);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: [
                        `Created a new fungible token!`,
                        `Token ID: ${response.tokenId.toString()}`,
                        ``,
                        `Details:`,
                        `${(0, utils_ts_2.createFTDetailsDescription)(createTokenData)}`,
                        ``,
                        `Transaction link: ${url}`
                    ].join("\n"),
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during token creation:", error);
            await callback({
                text: `Error during token creation: ${error.message}`,
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
                    text: "Create new token with name {{MyToken}} with symbol {{MTK}}, {{8}} decimals and {{1000}} initial supply.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new token named {{HederaDollar}} with ticker {{H$}}, {{4}} decimals, and {{1000000}} initial supply. I want to set the supply key so I could add more tokens later.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create token {{GameGold}} with symbol {{GG}}, {{2}} decimal places, and starting supply of {{750000}}. This is the final supply, don’t set a supply key.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Deploy a token named {{SuperToken}} with short code {{STK}}, {{5}} decimal places, and an issuance of {{100000}}. No additional tokens will be minted.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create new HTS token {{PixelCoin}} with symbol {{PXN}}, {{3}} decimal places, and {{500}} tokens minted. I want to control supply changes, so set the supply key.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Launch a new HTS token called {{SkyCredits}} with ticker {{SKC}}, {{9}} decimal places, and a total supply of {{25000}}. The supply is fixed.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_NEW_TOKEN",
        "HEDERA_CREATE_NEW_TOKEN",
        "HEDERA_NEW_FUNGIBLE_TOKEN",
    ],
};
