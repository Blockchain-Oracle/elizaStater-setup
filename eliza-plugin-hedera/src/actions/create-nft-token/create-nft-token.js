"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNFTTokenAction = void 0;
const core_1 = require("@elizaos/core");
const templates_1 = require("../../templates");
const client_1 = require("../../providers/client");
const create_nft_action_service_ts_1 = require("./services/create-nft-action-service.ts");
const schema_ts_1 = require("./schema.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_2 = require("./utils.ts");
exports.createNFTTokenAction = {
    name: "HEDERA_CREATE_NFT_TOKEN",
    description: "Create a new non-fungible token (NFT) on the Hedera network",
    handler: async (runtime, _message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const hederaCreateNFTTokenContext = (0, core_1.composeContext)({
                state: state,
                template: templates_1.hederaCreateNFTTokenTemplate,
                templatingEngine: "handlebars",
            });
            const hederaCreateNFTTokenContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: hederaCreateNFTTokenContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            console.log(`Extracted data: ${JSON.stringify(hederaCreateNFTTokenContent, null, 2)}`);
            const createTokenData = schema_ts_1.createNFTTokenParamsSchema.parse(hederaCreateNFTTokenContent);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const createTokenService = new create_nft_action_service_ts_1.CreateNftActionService(hederaProvider);
            const response = await createTokenService.execute(createTokenData);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Created new NFT token with id: ${response.tokenId.toString()}\n\nDetails:${(0, utils_ts_2.createNFTDetailsDescription)(createTokenData)}\n\nTransaction link: ${url}`,
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
                    text: "Create a new NFT token called {{MyNFT}} with symbol {{NFT}}, and a maximum supply of {{100}}. Add metadata: 'This is a test NFT token' and memo 'memo for NFT'.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create an NFT token named {{UniqueArt}} with symbol {{ART}} and a maximum supply of {{50}}. Set the metadata key to true and provide a memo: 'Unique art of the future' for it.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Deploy an NFT token called {{GamingItem}} with symbol {{GI}} and a maximum supply of {{1000}}. I want to set the admin key to manage the token later.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Launch a new NFT token named {{ArtCollectible}} with symbol {{ARTC}} and a maximum supply of {{10}}. Set the metadata and admin keys. Do not set the memo or metadata.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new NFT token called {{ExclusiveItem}} with symbol {{EI}} and a maximum supply of {{5}}. This token will have a metadata key, and no admin key or memo.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create an NFT token named {{LimitedEditionNFT}} with the symbol {{LENFT}} and a maximum supply of {{100}}. No admin or metadata key, and no memo required.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new NFT token called {{ArtPiece}} with symbol {{AP}}, a maximum supply of {{20}}, and add a memo for the launch.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
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
