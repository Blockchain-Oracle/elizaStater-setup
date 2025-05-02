import { describe, expect, it, beforeEach } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import * as dotenv from "dotenv";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Test connection with ElizaOS instance", () => {
    beforeEach(async () => {
        dotenv.config();
        await wait(1000);
    });
    it("should receive 'Welcome, this is the REST API!'", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const response = await elizaOsApiClient.getHello();

        expect(response.message).toEqual("Hello World!");
    });
    it("should post message to ElizaOs and receive response", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: "Whats your name?",
        };
        const response = await elizaOsApiClient.sendPrompt(prompt);
        expect(response[0].text).not.toBeNull();
    });
});
