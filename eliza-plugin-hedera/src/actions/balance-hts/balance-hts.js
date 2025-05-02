"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceHtsAction = void 0;
const core_1 = require("@elizaos/core");
const schema_ts_1 = require("./schema.ts");
const client_1 = require("../../providers/client");
const hts_balance_action_service_ts_1 = require("./services/hts-balance-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const templates_1 = require("../../templates");
exports.balanceHtsAction = {
    name: "HEDERA_HTS_BALANCE",
    description: "Returns provided HTS token balance for requested wallet",
    handler: async (runtime, _message, state, _options, callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaHtsBalanceContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.balanceHtsTemplate,
            templatingEngine: "handlebars",
        });
        const hederaHtsBalanceContent = await (0, core_1.generateObjectDeprecated)({
            runtime: runtime,
            context: hederaHtsBalanceContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            tokenId: hederaHtsBalanceContent.tokenId,
            address: hederaHtsBalanceContent.address,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaHtsBalanceParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                throw new Error(`Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(runtime);
            const networkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
            const action = new hts_balance_action_service_ts_1.HtsBalanceActionService(hederaProvider);
            const response = await action.execute(paramOptions, networkType);
            if (callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                await callback({
                    text: `Address ${paramOptions.address} has balance of token ${response.unit} equal ${response.balance} ${response.symbol} (token id: ${paramOptions.tokenId})`,
                    content: {
                        success: true,
                        amount: response.balance,
                        address: paramOptions.address,
                        symbol: response.unit,
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during fetching HTS token balance:", error);
            if (callback) {
                await callback({
                    text: `Error during fetching HTS token balance: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.balanceHtsTemplate,
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
                    text: "Show me balance of token {{0.0.5424086}} for wallet {{0.0.5423981}}",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Whats {{0.0.5422544}} balance for wallet {{0.0.5423981}}",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me balance of hts-token with id 0.0.5422268 for wallet 0.0.5423949. Call HEDERA_HTS_BALANCE action",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me balance of hts token with id {{0.0.5422268}} for wallet {{0.0.5423949}}.",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
    ],
    similes: ["HTS_BALANCE", "HTS_AMOUNT", "HTS_BALANCE_HEDERA"],
};
