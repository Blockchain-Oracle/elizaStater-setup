import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";
import { DetailedTokenBalance } from "./types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("get_all_balances", () => {
    let acc1: AccountData;
    let acc2: AccountData;
    let acc3: AccountData;
    let token1: string;
    let token2: string;
    let elizaOsApiClient: ElizaOSApiClient;
    let hederaApiClient: HederaMirrorNodeClient;
    let testCases: [string, string][];

    beforeAll(async () => {
        dotenv.config();
        try {
            const networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            // Create accounts
            acc1 = await networkClientWrapper.createAccount(0, -1);
            acc2 = await networkClientWrapper.createAccount(0, -1);
            acc3 = await networkClientWrapper.createAccount(0, -1);

            // Create tokens
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

            // Transfer tokens to accounts
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

            await wait(5000)

            // Initialize API clients
            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
            hederaApiClient = new HederaMirrorNodeClient("testnet");

            testCases = [
                [
                    acc1.accountId,
                    `Show me the balances of all tokens for wallet ${acc1.accountId}`,
                ],
                [
                    acc2.accountId,
                    `What are the token balances for wallet ${acc2.accountId}`,
                ],
                [
                    acc3.accountId,
                    `Show me all token balances for account ${acc3.accountId}`,
                ],
                [
                    process.env.HEDERA_ACCOUNT_ID!,
                    "Show me all your token balances.",
                ],
                [
                    process.env.HEDERA_ACCOUNT_ID!,
                    "Show me all my token balances.",
                ],
            ];
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("balance checks", () => {
        it("should test all token balances", async () => {
            for (const [accountId, promptText] of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                const allTokensBalances =
                    await hederaApiClient.getAllTokensBalances(accountId);

                const formattedBalances = allTokensBalances.map((token) => ({
                    ...token,
                    balanceInDisplayUnit: token.balanceInDisplayUnit.toString(),
                }));

                const tokensBalanceFromEliza =
                    // @ts-expect-error --- amount is not typed properly
                    response[response.length - 1].content.amount as Array<
                        Pick<
                            DetailedTokenBalance,
                            "balance" | "tokenId" | "tokenName" | "tokenSymbol"
                        >
                    >;

                formattedBalances.forEach((token) => {
                    const correspondingTokenFromEliza =
                        tokensBalanceFromEliza.find(
                            ({ tokenId: elizaTokenId }) =>
                                elizaTokenId === token.tokenId
                        );
             
                    expect(correspondingTokenFromEliza?.tokenId).toEqual(
                        token.tokenId
                    );
                    expect(correspondingTokenFromEliza?.balance).toEqual(
                        token.balance
                    );
                    expect(correspondingTokenFromEliza?.tokenName).toEqual(
                        token.tokenName
                    );
                    expect(correspondingTokenFromEliza?.tokenSymbol).toEqual(
                        token.tokenSymbol
                    );
                });
            }
        });
    });
});
