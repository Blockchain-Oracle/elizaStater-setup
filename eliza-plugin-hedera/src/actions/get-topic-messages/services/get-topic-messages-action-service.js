"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTopicMessageActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
const utils_ts_1 = require("../../../shared/utils.ts");
const constants_ts_1 = require("../../../shared/constants.ts");
class GetTopicMessageActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params, networkType) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const result = await agentKit.getTopicMessages(sdk_1.TopicId.fromString(params.topicId), networkType, params.lowerThreshold != "null"
            ? (0, utils_ts_1.convertStringToTimestamp)(params.lowerThreshold)
            : undefined, params.upperThreshold != "null"
            ? (0, utils_ts_1.convertStringToTimestamp)(params.upperThreshold)
            : undefined);
        return {
            status: constants_ts_1.TxStatus.SUCCESS,
            messages: result,
        };
    }
}
exports.GetTopicMessageActionService = GetTopicMessageActionService;
