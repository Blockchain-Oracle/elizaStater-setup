"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintNFTTokenAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const mint_nft_action_service_ts_1 = require("./services/mint-nft-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const schema_ts_1 = require("./schema.ts");
const templates_1 = require("../../templates");
exports.mintNFTTokenAction = {
    name: "HEDERA_MINT_NFT_TOKEN",
    description: "Action allowing minting non-fungible (NFT) tokens",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaMintNFTTokenContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.mintNFTTokenTemplate,
            templatingEngine: "handlebars",
        });
        const hederaMintNFTTokenContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaMintNFTTokenContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            tokenId: hederaMintNFTTokenContent.tokenId,
            tokenMetadata: hederaMintNFTTokenContent.tokenMetadata,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaMintNFTTokenParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map((e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`);
                throw new Error(`Error during parsing data from users prompt: ${errorMessages.join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new mint_nft_action_service_ts_1.MintNftActionService(hederaProvider);
            const response = await action.execute(paramOptions);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Successfully minted NFT ${paramOptions.tokenId}\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during minting NFT. Error:", error);
            if (callback) {
                await callback({
                    text: `Error during minting NFT. Error: ${error.message}`,
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
                    text: "Mint NFT {{0.0.5478757}}. Set it's metadata to '{{https://example.com/nft-image.png}}'.",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Mint NFT with id {{0.0.5478757}}. Assign '{{https://example.com/nft-image.png}}' to its metadata.",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Mint NFT {{0.0.5512318}} with metadata '{{Testing this nft}}'",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_MINT_NFT_TOKEN_ACTION",
        "HEDERA_MINT_NON_FUNGIBLE_TOKEN",
        "HCS_MINT_NFT",
    ],
};
