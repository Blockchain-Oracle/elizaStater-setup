"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTopicService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class DeleteTopicService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.topicId) {
            throw new Error("Missing topicId");
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        const topicId = sdk_1.TopicId.fromString(params.topicId);
        return agentKit.deleteTopic(topicId);
    }
}
exports.DeleteTopicService = DeleteTopicService;
