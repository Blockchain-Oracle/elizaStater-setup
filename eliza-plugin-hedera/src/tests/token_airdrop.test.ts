import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";
import { hashscanLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Test Token Airdrop", async () => {
    let acc1: AccountData;
    let acc2: AccountData;
    let acc3: AccountData;
    let acc4: AccountData;
    let acc5: AccountData;
    let token1: string;
    let token2: string;
    let token3: string;
    let elizaOsApiClient: ElizaOSApiClient;
    let hederaApiClient: HederaMirrorNodeClient;
    let networkClientWrapper: NetworkClientWrapper;
    let testCases: [string[], number, string, string][];

    beforeAll(async () => {
        dotenv.config();
        try {
            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            // Create test accounts
            acc1 = await networkClientWrapper.createAccount(0, -1);
            acc2 = await networkClientWrapper.createAccount(0, -1);
            acc3 = await networkClientWrapper.createAccount(0, -1);
            acc4 = await networkClientWrapper.createAccount(0, -1);
            acc5 = await networkClientWrapper.createAccount(0, -1);

            // Create test tokens
            token1 = await networkClientWrapper.createFT({
                name: "AirdropToken",
                symbol: "ADT",
                initialSupply: 10000000,
                decimals: 2,
            });

            token2 = await networkClientWrapper.createFT({
                name: "AirdropToken2",
                symbol: "ADT2",
                initialSupply: 10000,
                decimals: 0,
            });

            token3 = await networkClientWrapper.createFT({
                name: "AirdropToken3",
                symbol: "ADT3",
                initialSupply: 10000000,
                decimals: 3,
            });

            // Initialize API clients
            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
            hederaApiClient = new HederaMirrorNodeClient("testnet");

            // Define test cases using created accounts and tokens
            testCases = [
                [
                    [acc1.accountId, acc2.accountId, acc3.accountId],
                    10,
                    token1,
                    `Airdrop 10 tokens ${token1} to accounts ${acc1.accountId}, ${acc2.accountId}, ${acc3.accountId}`,
                ],
                [
                    [acc1.accountId, acc2.accountId, acc3.accountId],
                    2,
                    token2,
                    `Send token airdrop of 2 tokens ${token2} to accounts ${acc1.accountId}, ${acc2.accountId}, ${acc3.accountId}`,
                ],
                [
                    [
                        acc1.accountId,
                        acc2.accountId,
                        acc3.accountId,
                        acc4.accountId,
                        acc5.accountId,
                    ],
                    3,
                    token3,
                    `Make airdrop of 3 tokens  ${token3} to accounts ${acc1.accountId}, ${acc2.accountId}, ${acc3.accountId}, ${acc4.accountId}, ${acc5.accountId}`,
                ],
            ];

            await wait(5000);
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("token airdrops", () => {
        it("should process airdrop for dynamically created accounts", async () => {
            for (const [
                receiversAccountsIds,
                transferAmount,
                tokenId,
                promptText,
            ] of testCases) {
                const agentsAccountId = process.env.HEDERA_ACCOUNT_ID;

                if (
                    !agentsAccountId ||
                    receiversAccountsIds.find((id) => id === agentsAccountId)
                ) {
                    throw new Error(
                        "Env file must be defined and matching the env of running ElizaOs instance! Note that airdrops cannot be done to the operator account address."
                    );
                }

                // Get balances before
                const balanceAgentBefore =
                    await hederaApiClient.getTokenBalance(
                        agentsAccountId,
                        tokenId
                    );

                const balancesOfReceiversBefore = new Map<string, number>();
                for (const id of receiversAccountsIds) {
                    const balance = await hederaApiClient.getTokenBalance(
                        id,
                        tokenId
                    );
                    balancesOfReceiversBefore.set(id, balance);
                }

                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };
                const response = await elizaOsApiClient.sendPrompt(prompt);
                let txHash: string;

                const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);

                if (hashScanLinkMatch) {
                    txHash = `${hashScanLinkMatch[1]}-${hashScanLinkMatch[2].replace(".", "-")}`;
                    console.log(`Extracted tx hash: ${txHash}`);
                } else {
                    throw new Error(
                        "No match for transaction hash found in response from ElizaOs Agent."
                    );
                }

                // Get balances after transaction being successfully processed by mirror node
                await wait(5000);

                const balanceAgentAfter = await hederaApiClient.getTokenBalance(
                    agentsAccountId,
                    tokenId
                );

                const balancesOfReceiversAfter = new Map<string, number>(
                    await Promise.all(
                        receiversAccountsIds.map(
                            async (id): Promise<[string, number]> => {
                                const balance =
                                    await hederaApiClient.getTokenBalance(
                                        id,
                                        tokenId
                                    );
                                return [id, balance];
                            }
                        )
                    )
                );

                const txReport = await hederaApiClient.getTransactionReport(
                    txHash,
                    agentsAccountId,
                    receiversAccountsIds
                );

                // Compare before and after including the difference due to paid fees
                expect(txReport.status).toEqual("SUCCESS");
                expect(balanceAgentBefore).toEqual(
                    balanceAgentAfter +
                        transferAmount * receiversAccountsIds.length
                );
                receiversAccountsIds.forEach((id) =>
                    expect(balancesOfReceiversBefore.get(id)).toEqual(
                        balancesOfReceiversAfter.get(id)! - transferAmount
                    )
                );

                await wait(1000);
            }
        });
    });
});
