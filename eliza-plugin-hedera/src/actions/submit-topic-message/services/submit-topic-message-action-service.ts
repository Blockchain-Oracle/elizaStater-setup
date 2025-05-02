import { HederaProvider } from "../../../providers/client";
import { SubmitMessageResult } from "hedera-agent-kit";
import { HederaSubmitTopicMessageParams } from "../types.ts";
import { TopicId } from "@hashgraph/sdk";

export class SubmitTopicMessageActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaSubmitTopicMessageParams
    ): Promise<SubmitMessageResult> {
        const agentKit = this.hederaProvider.getHederaAgentKit();

        return agentKit.submitTopicMessage(
            TopicId.fromString(params.topicId),
            params.message
        );
    }
}
