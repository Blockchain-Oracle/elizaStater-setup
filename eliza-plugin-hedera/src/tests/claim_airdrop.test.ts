import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { hashscanLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
describe("claim_airdrop", () => {
    let airdropCreatorAccount: AccountData;
    let token1: string;
    let token2: string;
    let networkClientWrapper: NetworkClientWrapper;
    let claimerInitialMaxAutoAssociation: number;
    let elizaOsApiClient: ElizaOSApiClient;
    let testCases: {
        receiverAccountId: string;
        senderAccountId: string;
        tokenId: string;
        promptText: string;
        expectedClaimedAmount: number;
    }[];
    let hederaMirrorNodeClient: HederaMirrorNodeClient;

    beforeAll(async () => {
        try {
            hederaMirrorNodeClient = new HederaMirrorNodeClient(
                process.env.HEDERA_NETWORK_TYPE as
                    | "testnet"
                    | "mainnet"
                    | "previewnet"
            );

            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            airdropCreatorAccount = await networkClientWrapper.createAccount(
                15,
                0
            );

            claimerInitialMaxAutoAssociation = (
                await hederaMirrorNodeClient.getAccountInfo(
                    networkClientWrapper.getAccountId()
                )
            ).max_automatic_token_associations;

            const maxAutoAssociationForTest =
                await hederaMirrorNodeClient.getAutomaticAssociationsCount(
                    networkClientWrapper.getAccountId()
                );

            await networkClientWrapper.setMaxAutoAssociation(
                maxAutoAssociationForTest
            );

            const airdropCreatorAccountNetworkClientWrapper =
                new NetworkClientWrapper(
                    airdropCreatorAccount.accountId,
                    airdropCreatorAccount.privateKey,
                    "ECDSA",
                    "testnet"
                );

            await Promise.all([
                airdropCreatorAccountNetworkClientWrapper.createFT({
                    name: "ClaimAirdrop1",
                    symbol: "CA1",
                    initialSupply: 1000,
                    decimals: 2,
                }),
                airdropCreatorAccountNetworkClientWrapper.createFT({
                    name: "ClaimAirdrop2",
                    symbol: "CA2",
                    initialSupply: 1000,
                    decimals: 2,
                }),
            ]).then(([_token1, _token2]) => {
                token1 = _token1;
                token2 = _token2;
            });

            await Promise.all([
                airdropCreatorAccountNetworkClientWrapper.airdropToken(token1, [
                    {
                        accountId: process.env.HEDERA_ACCOUNT_ID!,
                        amount: 10,
                    },
                ]),
                airdropCreatorAccountNetworkClientWrapper.airdropToken(token2, [
                    {
                        accountId: process.env.HEDERA_ACCOUNT_ID!,
                        amount: 40,
                    },
                ]),
            ]);

            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();

            testCases = [
                {
                    receiverAccountId: networkClientWrapper.getAccountId(),
                    senderAccountId: airdropCreatorAccount.accountId,
                    tokenId: token1,
                    promptText: `Claim airdrop for token ${token1} from sender ${airdropCreatorAccount.accountId}`,
                    expectedClaimedAmount: 10,
                },
                {
                    receiverAccountId: networkClientWrapper.getAccountId(),
                    senderAccountId: airdropCreatorAccount.accountId,
                    tokenId: token2,
                    promptText: `Claim airdrop for token ${token2} from sender ${airdropCreatorAccount.accountId}`,
                    expectedClaimedAmount: 40,
                },
            ];
        } catch (error) {
            console.error("Error in setup:", error);
            throw error;
        }
    });

    afterAll(async () => {
        await networkClientWrapper.setMaxAutoAssociation(
            claimerInitialMaxAutoAssociation
        );
    });

    describe("claim airdrop checks", () => {
        it("should claim airdrop", async () => {
            for (const {
                receiverAccountId,
                tokenId,
                promptText,
                expectedClaimedAmount,
            } of testCases || []) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);

                await wait(5000);

                const tokenInfo = await hederaMirrorNodeClient.getAccountToken(
                    receiverAccountId,
                    tokenId
                );

                expect(tokenInfo?.balance ?? 0).toBe(expectedClaimedAmount);
                expect(hashScanLinkMatch).toBeTruthy();
            }
        });
    });
});
