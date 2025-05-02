"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaPlugin = void 0;
const client_1 = require("./providers/client");
const balance_hbar_ts_1 = require("./actions/balance-hbar/balance-hbar.ts");
const balance_hts_ts_1 = require("./actions/balance-hts/balance-hts.ts");
const balance_all_tokens_ts_1 = require("./actions/balances-all-tokens/balance-all-tokens.ts");
const transfer_ts_1 = require("./actions/transfer/transfer.ts");
const create_token_ts_1 = require("./actions/create-token/create-token.ts");
const associate_token_ts_1 = require("./actions/associate-token/associate-token.ts");
const token_holders_ts_1 = require("./actions/token-holders/token-holders.ts");
const airdrop_token_ts_1 = require("./actions/airdrop-token/airdrop-token.ts");
const reject_token_ts_1 = require("./actions/reject-token/reject-token.ts");
const pending_airdrops_ts_1 = require("./actions/pending-airdrops/pending-airdrops.ts");
const claim_airdrop_ts_1 = require("./actions/claim-airdrop/claim-airdrop.ts");
const transfer_token_ts_1 = require("./actions/transfer-token/transfer-token.ts");
const create_topic_ts_1 = require("./actions/create-topic/create-topic.ts");
const delete_topic_ts_1 = require("./actions/delete-topic/delete-topic.ts");
const dissociate_token_ts_1 = require("./actions/dissociate-token/dissociate-token.ts");
const topic_info_ts_1 = require("./actions/topic-info/topic-info.ts");
const submit_topic_message_ts_1 = require("./actions/submit-topic-message/submit-topic-message.ts");
const get_topic_messages_ts_1 = require("./actions/get-topic-messages/get-topic-messages.ts");
const mint_token_ts_1 = require("./actions/mint-token/mint-token.ts");
const set_spending_approval_ts_1 = require("./actions/set-spending-approval/set-spending-approval.ts");
const create_nft_token_ts_1 = require("./actions/create-nft-token/create-nft-token.ts");
const mint_token_ts_2 = require("./actions/mint-nft-token/mint-token.ts");
exports.hederaPlugin = {
    name: "Hedera",
    description: "Hedera blockchain integration plugin",
    providers: [client_1.hederaClientProvider],
    evaluators: [],
    services: [],
    actions: [
        balance_hbar_ts_1.balanceHbarAction,
        balance_hts_ts_1.balanceHtsAction,
        balance_all_tokens_ts_1.balancesAllTokensAction,
        transfer_ts_1.transferAction,
        create_token_ts_1.createTokenAction,
        token_holders_ts_1.tokenHoldersAction,
        associate_token_ts_1.associateTokenAction,
        airdrop_token_ts_1.airdropTokenAction,
        reject_token_ts_1.rejectTokenAction,
        pending_airdrops_ts_1.pendingAirdropsAction,
        claim_airdrop_ts_1.claimAirdropAction,
        transfer_token_ts_1.transferTokenAction,
        create_topic_ts_1.createTopicAction,
        delete_topic_ts_1.deleteTopicAction,
        dissociate_token_ts_1.dissociateTokenAction,
        topic_info_ts_1.topicInfoAction,
        submit_topic_message_ts_1.submitTopicMessageAction,
        get_topic_messages_ts_1.getTopicMessagesAction,
        mint_token_ts_1.mintTokenAction,
        create_nft_token_ts_1.createNFTTokenAction,
        mint_token_ts_2.mintNFTTokenAction,
        set_spending_approval_ts_1.setSpendingApprovalAction,
        create_nft_token_ts_1.createNFTTokenAction
    ],
};
exports.default = exports.hederaPlugin;
