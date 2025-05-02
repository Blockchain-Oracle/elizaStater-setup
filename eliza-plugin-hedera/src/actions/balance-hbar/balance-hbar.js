"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceHbarAction = void 0;
const core_1 = require("@elizaos/core");
const schema_ts_1 = require("./schema.ts");
const client_1 = require("../../providers/client");
const hbar_balance_action_service_ts_1 = require("./services/hbar-balance-action-service.ts");
const constants_ts_1 = require("../../shared/constants.ts");
const templates_1 = require("../../templates");
exports.balanceHbarAction = {
    name: "HEDERA_HBAR_BALANCE",
    description: "Returns HBAR balance of requested wallet",
    handler: async (_runtime, _message, state, _options, _callback) => {
        state.lastMessage = state.recentMessagesData[1].content.text;
        const hederaHbarBalanceContext = (0, core_1.composeContext)({
            state: state,
            template: templates_1.balanceHbarTemplate,
            templatingEngine: "handlebars",
        });
        const hederaHbarBalanceContent = await (0, core_1.generateObjectDeprecated)({
            runtime: _runtime,
            context: hederaHbarBalanceContext,
            modelClass: core_1.ModelClass.SMALL,
        });
        const paramOptions = {
            symbol: hederaHbarBalanceContent.symbol,
            address: hederaHbarBalanceContent.address,
        };
        console.log(`Extracted data: ${JSON.stringify(paramOptions, null, 2)}`);
        try {
            const validationResult = schema_ts_1.hederaHbarBalanceParamsSchema.safeParse(paramOptions);
            if (!validationResult.success) {
                throw new Error(`Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`);
            }
            const hederaProvider = new client_1.HederaProvider(_runtime);
            const action = new hbar_balance_action_service_ts_1.HbarBalanceActionService(hederaProvider);
            const response = await action.execute(paramOptions);
            if (_callback && response.status === constants_ts_1.TxStatus.SUCCESS) {
                await _callback({
                    text: `Address ${paramOptions.address} has balance of ${response.balance} HBAR`,
                    content: {
                        success: true,
                        amount: response.balance,
                        address: paramOptions.address,
                        symbol: "HBAR",
                    },
                });
            }
            return true;
        }
        catch (error) {
            console.error("Error during fetching balance:", error);
            if (_callback) {
                await _callback({
                    text: `Error during fetching balance: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: templates_1.balanceHbarTemplate,
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
                    text: "Show me HBAR balance of wallet {{0.0.5423981}}",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Whats HBAR balance of wallet {{0.0.5423981}}",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me HBAR balance of wallet 0.0.5423949. Call HEDERA_HBAR_BALANCE action",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
        ],
    ],
    similes: ["HBAR_BALANCE"],
};
