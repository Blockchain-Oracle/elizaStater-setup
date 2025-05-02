"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingAirdropsAction = void 0;
const core_1 = require("@elizaos/core");
const client_1 = require("../../providers/client");
const templates_1 = require("../../templates");
const schema_ts_1 = require("./schema.ts");
const get_pending_airdrops_ts_1 = require("./services/get-pending-airdrops.ts");
const hedera_agent_kit_1 = require("hedera-agent-kit");
const hedera_agent_kit_2 = require("hedera-agent-kit");
exports.pendingAirdropsAction = {
    name: "HEDERA_PENDING_AIRDROPS",
    description: "Returns currently pending airdrops for accountId",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const pendingAirdropsContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.pendingAirdropTemplate,
            templatingEngine: "handlebars",
        });
        const pendingAirdropContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: pendingAirdropsContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        console.log(`Extracted data: ${JSON.stringify(pendingAirdropsContext, null, 2)}`);
        try {
            const pendingAirdropData = schema_ts_1.pendingAirdropsParams.parse(pendingAirdropContent);
            const accountId = pendingAirdropData.accountId ||
                runtime.getSetting("HEDERA_ACCOUNT_ID");
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const hederaProvider = new client_1.HederaProvider(runtime);
            const action = new get_pending_airdrops_ts_1.GetPendingAirdropsService(hederaProvider);
            const pendingAirdrops = await action.execute(accountId, networkType);
            if (!pendingAirdrops.length) {
                await callback({
                    text: `There are no pending airdrops for accountId ${accountId}`,
                    content: `There are no pending airdrops for accountId ${accountId}`,
                });
                return true;
            }
            const formatedAirdrops = await Promise.all(pendingAirdrops.map(async (airdrop, index) => {
                const tokenDetails = await (0, hedera_agent_kit_2.get_hts_token_details)(airdrop.token_id, networkType);
                const displayAmount = await (0, hedera_agent_kit_1.toDisplayUnit)(airdrop.token_id, airdrop.amount, networkType);
                return `(${index + 1}) ${displayAmount.toString()} ${tokenDetails.symbol} (token id: ${airdrop.token_id}) from ${airdrop.sender_id}`;
            })).then((results) => results.join("\n"));
            await callback({
                text: `Here are pending airdrops for account ${accountId} \n\n ${formatedAirdrops}`,
                content: {
                    availableAirdrops: pendingAirdrops,
                },
            });
            return true;
        }
        catch (error) {
            console.error("Error during fetching pending airdrops:", error);
            if (callback) {
                await callback({
                    text: `Error during fetching pending airdrops: ${error.message}`,
                    content: { error: error.message },
                });
            }
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
                user: "{{user1}}",
                content: {
                    text: "Show me pending airdrops for account {{0.0.5393076}}",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me my pending airdrops",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
        ],
    ],
    similes: ["PENDING_AIRDROPS", "GET_AIRDROPS", "GET_PENDING_AIRDROPS"],
};
