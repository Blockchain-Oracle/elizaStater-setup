import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt, NetworkType } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { hashscanLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
describe("delete_topic", () => {
    let topic1: string;
    let topic2: string;
    let topic3: string;
    let elizaOsApiClient: ElizaOSApiClient;
    let testCases: { textPrompt: string; topicId: string }[];
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
                    textPrompt: `Delete topic with id ${topic1}`,
                    topicId: topic1,
                },
                {
                    textPrompt: `Delete topic with id ${topic2}`,
                    topicId: topic2,
                },
                {
                    textPrompt: `Delete topic with id ${topic3}`,
                    topicId: topic3,
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

    describe("delete topic checks", () => {
        it("should delete topic", async () => {
            for (const { textPrompt, topicId } of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: textPrompt,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);
                await wait(5000);

                const topicInfo =
                    await hederaMirrorNodeClient.getTopic(topicId);

                expect(topicInfo.deleted).toBe(true);
                expect(hashScanLinkMatch).toBeTruthy();
            }
        });
    });
});
