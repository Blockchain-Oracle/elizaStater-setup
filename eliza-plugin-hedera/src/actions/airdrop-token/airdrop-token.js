"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.airdropTokenAction = void 0;
const templates_1 = require("../../templates");
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const schema_ts_1 = require("./schema.ts");
const airdrop_token_ts_1 = require("./services/airdrop-token.ts");
const utils_ts_1 = require("../../shared/utils.ts");
const constants_ts_1 = require("../../shared/constants.ts");
exports.airdropTokenAction = {
    name: "HEDERA_AIRDROP_TOKEN",
    description: "Airdrop a token on the Hedera network",
    handler: async (runtime, _message, state, _options, callback) => {
        try {
            state.lastMessage = state.recentMessagesData[1].content.text;
            const hederaAirdropTokenContext = (0, core_1.composeContext)({
                state: state,
                template: templates_1.hederaAirdropTokenTemplate,
                templatingEngine: "handlebars",
            });
            const hederaAirdropTokenContent = await (0, core_1.generateObjectDeprecated)({
                runtime: runtime,
                context: hederaAirdropTokenContext,
                modelClass: core_1.ModelClass.SMALL,
            });
            console.log(`Extracted data: ${JSON.stringify(hederaAirdropTokenContent, null, 2)}`);
            const airdropTokenData = schema_ts_1.airdropTokenParamsSchema.parse(hederaAirdropTokenContent);
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const airdropTokenService = new airdrop_token_ts_1.AirdropTokenService(hederaProvider);
            const response = await airdropTokenService.execute(airdropTokenData, networkType);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                const url = (0, utils_ts_1.generateHashscanUrl)(response.txHash, networkType);
                await callback({
                    text: `Airdrop token successfully executed.\nTransaction link: ${url}`,
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during token airdrop:", error);
            await callback({
                text: `Error during token airdrop: ${error.message}`,
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
                    text: "Airdrop {{10}} tokens {{0.0.5426001}} for {{0.0.5399001}}, {{0.0.5399012}}, {{0.0.5399023}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Airdrop {{3.75}} tokens {{0.0.5432002}} to wallets {{0.0.5401005}}, {{0.0.5402006}}, {{0.0.5403007}}, {{0.0.5404008}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Send a token airdrop of {{15}} tokens with id {{0.0.5427890}} to {{0.0.5412345}}, {{0.0.5416789}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Airdrop {{7.2}} tokens {{0.0.5436781}} to {{0.0.5401122}}, {{0.0.5402233}}, {{0.0.5403344}}, {{0.0.5404455}}, {{0.0.5405566}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Make airdrop of {{20}} tokens (token id: {{0.0.5456789}}) to multiple wallets: {{0.0.5410001}}, {{0.0.5410002}}, {{0.0.5410003}}, {{0.0.5410004}}, {{0.0.5410005}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_DROP_TOKEN",
        "HEDERA_DROP_TOKENS",
        "HEDERA_AIRDROP_TOKENS",
    ],
};
