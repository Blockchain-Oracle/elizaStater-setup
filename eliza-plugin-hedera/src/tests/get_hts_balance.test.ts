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
    let token1: string;
    let token2: string;
    let elizaOsApiClient: ElizaOSApiClient;
    let hederaApiClient: HederaMirrorNodeClient;
    let testCases: [string, string, string][];

    beforeAll(async () => {
        dotenv.config();
        try {
            const networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );
            acc1 = await networkClientWrapper.createAccount(0, -1);
            acc2 = await networkClientWrapper.createAccount(0, -1);
            acc3 = await networkClientWrapper.createAccount(0, -1);

            token1 = await networkClientWrapper.createFT({
                name: "MyToken",
                symbol: "MTK",
                initialSupply: 1000,
                decimals: 2,
            });
            token2 = await networkClientWrapper.createFT({
                name: "MyToken2",
                symbol: "MTK2",
                initialSupply: 2000,
                decimals: 0,
            });

            await networkClientWrapper.transferToken(
                acc1.accountId,
                token1,
                100
            );
            await networkClientWrapper.transferToken(
                acc2.accountId,
                token2,
                123
            );
            await networkClientWrapper.transferToken(
                acc3.accountId,
                token2,
                10
            );
            await networkClientWrapper.transferToken(acc3.accountId, token1, 7);

            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
            hederaApiClient = new HederaMirrorNodeClient("testnet");

            testCases = [
                [
                    acc1.accountId,
                    token1,
                    `What's balance of token ${token1} for ${acc1.accountId}`,
                ],
                [
                    acc2.accountId,
                    token2,
                    `How many tokens with id ${token2} account ${acc2.accountId} has`,
                ],
                [
                    acc3.accountId,
                    token2,
                    `Check balance of token ${token2} for wallet ${acc3.accountId}`,
                ],
                [
                    acc1.accountId,
                    token2,
                    `What's balance of ${token2} for ${acc1.accountId}`,
                ],
                [
                    acc3.accountId,
                    token1,
                    `What is the token balance of ${token1} account ${acc3.accountId} has`,
                ],
                [
                    acc3.accountId,
                    token2,
                    `Check balance of token ${token2} for wallet ${acc3.accountId}`,
                ],
            ];
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("balance checks", () => {
        it("should test dynamic token balances", async () => {
            for (const [accountId, tokenId, promptText] of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                let hederaActionBalance: number;

                const match =
                    response[response.length - 1].text.match(
                        /equal (\d+(\.\d+)?)/
                    );

                if (match) {
                    hederaActionBalance = parseFloat(match[1]);
                } else {
                    throw new Error(
                        `No match for HTS token balance found in response from ElizaOs Agent for account ${accountId} and token ${tokenId}`
                    );
                }

                const mirrorNodeBalance = await hederaApiClient.getTokenBalance(
                    accountId,
                    tokenId
                );

                expect(hederaActionBalance).toEqual(mirrorNodeBalance);

                await wait(1000);
            }
        });
    });
});
