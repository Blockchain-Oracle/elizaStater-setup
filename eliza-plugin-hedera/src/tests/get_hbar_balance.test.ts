import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("get_hbar_balance", () => {
    let acc1: AccountData;
    let acc2: AccountData;
    let acc3: AccountData;
    let elizaOsApiClient: ElizaOSApiClient;
    let hederaApiClient: HederaMirrorNodeClient;
    let testCases: [string, string][];

    beforeAll(async () => {
        dotenv.config();
        try {
            const wrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );
            acc1 = await wrapper.createAccount(1);
            acc2 = await wrapper.createAccount(0.3);
            acc3 = await wrapper.createAccount(0);

            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
            hederaApiClient = new HederaMirrorNodeClient("testnet");

            testCases = [
                [acc1.accountId, `What's HBAR balance for ${acc1.accountId}`],
                [acc2.accountId, `How much HBARs has ${acc2.accountId}`],
                [
                    acc3.accountId,
                    `Check HBAR balance of wallet ${acc3.accountId}`,
                ],
            ];
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("balance checks", () => {
        it("should test dynamic account balances", async () => {
            for (const [accountId, promptText] of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                let hederaActionBalance: number;

                const match = response[response.length - 1].text.match(
                    /(\d+\.\d+|\d+)\s*HBAR/
                );

                if (match) {
                    hederaActionBalance = parseFloat(match[1]);
                } else {
                    throw new Error(
                        "No match for HBAR balance found in response from ElizaOs Agent."
                    );
                }

                const mirrorNodeBalance =
                    await hederaApiClient.getHbarBalance(accountId);

                expect(hederaActionBalance).toEqual(mirrorNodeBalance);

                await wait(1000);
            }
        });
    });
});
