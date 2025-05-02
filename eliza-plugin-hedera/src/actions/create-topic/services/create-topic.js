"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTopicService = void 0;
class CreateTopicService {
    constructor(hederaProvider) {
        this.hederaProvider = hederaProvider;
    }
    async execute(params) {
        if (!params.memo) {
            throw new Error("Missing memo of new topic");
        }
        if (params.isSubmitKey === null) {
            params.isSubmitKey = false;
        }
        const agentKit = this.hederaProvider.getHederaAgentKit();
        return agentKit.createTopic(params.memo, params.isSubmitKey);
    }
}
exports.CreateTopicService = CreateTopicService;
