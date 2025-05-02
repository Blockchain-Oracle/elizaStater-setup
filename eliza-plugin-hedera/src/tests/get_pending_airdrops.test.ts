import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";

describe("get_pending_airdrops", () => {
    let acc1: AccountData;
    let acc2: AccountData;
    let acc3: AccountData;
    let token1: string;
    let elizaOsApiClient: ElizaOSApiClient;
    let testCases: [string, string, string, number][];
    let networkClientWrapper: NetworkClientWrapper;

    beforeAll(async () => {
        dotenv.config();
        try {
            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            await Promise.all([
                networkClientWrapper.createAccount(0, 0),
                networkClientWrapper.createAccount(0, 0),
                networkClientWrapper.createAccount(0, 0),
            ]).then(([_acc1, _acc2, _acc3]) => {
                acc1 = _acc1;
                acc2 = _acc2;
                acc3 = _acc3;
            });


            token1 = await networkClientWrapper.createFT({
                name: "MyToken",
                symbol: "MTK",
                initialSupply: 1000,
                decimals: 2,
            });

            await networkClientWrapper.airdropToken(token1, [
                {
                    accountId: acc1.accountId,
                    amount: 10,
                },
                {
                    accountId: acc2.accountId,
                    amount: 10,
                },
                {
                    accountId: acc3.accountId,
                    amount: 7,
                },
            ]);

            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();

            testCases = [
                [
                    acc1.accountId,
                    token1,
                    `Show me pending airdrops for account ${acc1.accountId}`,
                    10,
                ],
                [
                    acc2.accountId,
                    token1,
                    `Get pending airdrops for account ${acc2.accountId}`,
                    10,
                ],
                [
                    acc3.accountId,
                    token1,
                    `Display pending airdrops for account ${acc3.accountId}`,
                    7,
                ],
            ];
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    describe("pending airdrops checks", () => {
        it("should test dynamic pending airdrops", async () => {
            for (const [
                accountId,
                tokenId,
                promptText,
                expectedAmount,
            ] of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);

                const airdrops: {
                    amount: number;
                    receiver_id: string;
                    sender_id: string;
                    token_id: string;
                }[] = // @ts-expect-error -- type from sendPrompt doesn't include availableAirdrops
                  response[response.length - 1]?.content?.availableAirdrops as {
                      amount: number;
                      receiver_id: string;
                      sender_id: string;
                      token_id: string;
                  }[];

                if (!airdrops.length) {
                    throw new Error(
                        `No airdrops found for account ${accountId}`
                    );
                }

                const relevantAirdrop = airdrops.find(
                    (airdrop) =>
                        airdrop.token_id === tokenId &&
                        airdrop.receiver_id === accountId
                );

                if (!relevantAirdrop) {
                    throw new Error(
                        `No matching airdrop found for token ${tokenId} and account ${accountId}`
                    );
                }

                expect(relevantAirdrop.amount).toEqual(expectedAmount);
                expect(relevantAirdrop.token_id).toEqual(token1);
                expect(relevantAirdrop.sender_id).toEqual(
                    networkClientWrapper.getAccountId()
                );
            }
        });
    });
});
