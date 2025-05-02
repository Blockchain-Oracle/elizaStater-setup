"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicInfoActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
const utils_ts_1 = require("../../../shared/utils.ts");
class TopicInfoActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        if (!params.topicId) {
            throw new Error("No token id provided!");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const topicInfo = await agentKit.getTopicInfo(sdk_1.TopicId.fromString(params.topicId), networkType);
        const adminKey = topicInfo?.admin_key?.key
            ? `${topicInfo.admin_key.key}\n   type: ${topicInfo.admin_key._type}`
            : `not available`;
        const submitKey = topicInfo?.submit_key?.key
            ? `${topicInfo.submit_key.key}\n   type: ${topicInfo.submit_key._type}`
            : `not available`;
        const creationTimeUtc = (0, utils_ts_1.convertTimestampToUTC)(topicInfo.created_timestamp);
        const expirationTimeUtc = topicInfo?.timestamp?.to
            ? (0, utils_ts_1.convertTimestampToUTC)(topicInfo.timestamp.to)
            : "null";
        const memo = topicInfo?.memo ? topicInfo.memo : `not available`;
        return [
            "--------------------------------------",
            `Memo: ${memo}`,
            `Creation time: ${creationTimeUtc}`,
            `Expiration time: ${expirationTimeUtc}`,
            "Admin key:",
            `   ${adminKey}`,
            "Submit key:",
            `   ${submitKey}`,
            `Deleted: ${topicInfo.deleted}`,
            "--------------------------------------",
        ].join("\n");
    }
}
exports.TopicInfoActionService = TopicInfoActionService;
