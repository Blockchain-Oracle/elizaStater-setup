import { describe, it, beforeAll, expect } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt, NetworkType } from "./types";
import * as dotenv from "dotenv";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { hashscanLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
describe("create_topic", () => {
    let elizaOsApiClient: ElizaOSApiClient;
    const hederaMirrorNodeClient = new HederaMirrorNodeClient(process.env.HEDERA_NETWORK_TYPE as NetworkType);
    beforeAll(async () => {
        try {
            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("create_topic", () => {
        it("should create topic", async () => {
            const MEMO = "Hello world";
            const prompt: ElizaOSPrompt = {
                user: "user",
                text: `Create a topic with memo "${MEMO}"`,
            };

            const response = await elizaOsApiClient.sendPrompt(prompt);
            const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);
            await wait(5000);

            const topicId = response[response.length - 1].content?.topicId;

            if (!topicId) {
                throw new Error("No topic ID found");
            }

            const topic = await hederaMirrorNodeClient.getTopic(topicId);
            expect(topic.memo).toEqual(MEMO);
            expect(hashScanLinkMatch).toBeTruthy();
        });

        it("should create topic with submit key", async () => {
            const MEMO = "Hello world";
            const prompt: ElizaOSPrompt = {
                user: "user",
                text: `Create a topic with memo "${MEMO}". Restrict posting with a key`,
            };

            const response = await elizaOsApiClient.sendPrompt(prompt);
            const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);
            await wait(5000);

            const topicId = response[response.length - 1].content?.topicId;

            if (!topicId) {
                throw new Error("No topic ID found");
            }

            const topic = await hederaMirrorNodeClient.getTopic(topicId);

            expect(topic.memo).toEqual(MEMO);
            expect(!!topic.submit_key).toBeTruthy();
            expect(hashScanLinkMatch).toBeTruthy();

        });

        it("should create topic without submit key", async () => {
            const MEMO = "Hello world";
            const prompt: ElizaOSPrompt = {
                user: "user",
                text: `Create a topic with memo "${MEMO}". Do not set a submit key`,
            };

            const response = await elizaOsApiClient.sendPrompt(prompt);
            const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);
            await wait(5000);

            const topicId = response[response.length - 1].content?.topicId;

            if (!topicId) {
                throw new Error("No topic ID found");
            }

            const topic = await hederaMirrorNodeClient.getTopic(topicId);

            expect(topic.memo).toEqual(MEMO);
            expect(!!topic.submit_key).toBeTruthy();
            expect(hashScanLinkMatch).toBeTruthy();
        });
    });
});
