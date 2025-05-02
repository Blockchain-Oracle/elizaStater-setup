import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt, NetworkType } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { hashscanLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
describe("submit_topic_message", () => {
    let topic1: string;
    let topic2: string;
    let topic3: string;
    const MESSAGE1: string = "Message1";
    const MESSAGE2: string = "Message2";
    const MESSAGE3: string = "Message3";
    let elizaOsApiClient: ElizaOSApiClient;
    let testCases: { textPrompt: string; topicId: string; message: string }[];
    let networkClientWrapper: NetworkClientWrapper;
    const hederaMirrorNodeClient = new HederaMirrorNodeClient(
        process.env.HEDERA_NETWORK_TYPE as NetworkType
    );

    beforeAll(async () => {
        try {
            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            await Promise.all([
                networkClientWrapper.createTopic("Hello world 1", true),
                networkClientWrapper.createTopic("Hello world 2", true),
                networkClientWrapper.createTopic("Hello world 3", true),
            ]).then(([_topic1, _topic2, _topic3]) => {
                topic1 = _topic1.topicId;
                topic2 = _topic2.topicId;
                topic3 = _topic3.topicId;
            });

            testCases = [
                {
                    textPrompt: `Submit message ${MESSAGE1} to topic ${topic1}`,
                    topicId: topic1,
                    message: MESSAGE1,
                },
                {
                    textPrompt: `Submit message ${MESSAGE2} to topic ${topic2}`,
                    topicId: topic2,
                    message: MESSAGE2,
                },
                {
                    textPrompt: `Submit message ${MESSAGE3} to topic ${topic3}`,
                    topicId: topic3,
                    message: MESSAGE3,
                },
            ];

            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("submit topic message checks", () => {
        it("should submit message to topic", async () => {
            for (const { textPrompt, topicId, message } of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: textPrompt,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);

                await wait(5000);
                
                const topicMessages =
                    await hederaMirrorNodeClient.getTopicMessages(topicId);

                const receivedMessage = topicMessages.find(
                    ({ message: _message }) => {
                        return message === _message;
                    }
                );
                expect(receivedMessage).toBeTruthy();
                expect(hashScanLinkMatch).toBeTruthy();
            }
        });
    });
});
