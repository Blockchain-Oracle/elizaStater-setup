import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { AccountData } from "./utils/testnetUtils";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { hashscanLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
describe("dissociate_token", () => {
    let tokenCreatorAccount: AccountData;
    let token1: string;
    let token2: string;
    let networkClientWrapper: NetworkClientWrapper;
    let elizaOsApiClient: ElizaOSApiClient;
    let testCases: {
        tokenToDisassociateId: string;
        promptText: string;
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

            tokenCreatorAccount = await networkClientWrapper.createAccount(
                15,
                0
            );

            const tokenCreatorAccountNetworkClientWrapper =
                new NetworkClientWrapper(
                    tokenCreatorAccount.accountId,
                    tokenCreatorAccount.privateKey,
                    "ECDSA",
                    "testnet"
                );

            await Promise.all([
                tokenCreatorAccountNetworkClientWrapper.createFT({
                    name: "TokenToAssociate1",
                    symbol: "TTA1",
                    initialSupply: 1000,
                    decimals: 2,
                }),
                tokenCreatorAccountNetworkClientWrapper.createFT({
                    name: "TokenToAssociate2",
                    symbol: "TTA2",
                    initialSupply: 1000,
                    decimals: 2,
                }),
            ]).then(([_token1, _token2]) => {
                token1 = _token1;
                token2 = _token2;
            });

            await Promise.all([
                networkClientWrapper.associateToken(token1),
                networkClientWrapper.associateToken(token2),
            ]);

            testCases = [
                {
                    tokenToDisassociateId: token1,
                    promptText: `Disassociate token ${token1} from account ${networkClientWrapper.getAccountId()}`,
                },
                {
                    tokenToDisassociateId: token2,
                    promptText: `Disassociate token ${token2} from account ${networkClientWrapper.getAccountId()}`,
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

    describe("dissociate token checks", () => {
        it("should dissociate token", async () => {
            for (const { promptText, tokenToDisassociateId } of testCases ||
                []) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: promptText,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);
                await wait(5000);

                const token = await hederaMirrorNodeClient.getAccountToken(
                    networkClientWrapper.getAccountId(),
                    tokenToDisassociateId
                );

                expect(token).toBeUndefined();
                expect(hashScanLinkMatch).toBeTruthy();
            }
        });
    });
});
