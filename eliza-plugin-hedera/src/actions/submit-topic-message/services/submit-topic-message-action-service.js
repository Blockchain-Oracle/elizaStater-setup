"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitTopicMessageActionService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class SubmitTopicMessageActionService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return agentKit.submitTopicMessage(sdk_1.TopicId.fromString(params.topicId), params.message);
    }
}
exports.SubmitTopicMessageActionService = SubmitTopicMessageActionService;
