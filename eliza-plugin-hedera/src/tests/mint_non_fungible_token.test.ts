import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { NetworkType} from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { ElizaOSApiClient } from "./utils/elizaApiClient";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();

describe("mint_non_fungible_token", () => {
    let hederaApiClient: HederaMirrorNodeClient;
    let networkClientWrapper: NetworkClientWrapper;
    let elizaOsApiClient: ElizaOSApiClient;

    beforeAll(async () => {
            hederaApiClient = new HederaMirrorNodeClient("testnet" as NetworkType);
            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );
            
            elizaOsApiClient = new ElizaOSApiClient(
                `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
            );
            await elizaOsApiClient.setup();
        }
    );

    beforeEach(async () => {
        dotenv.config();
        await wait(3000);
    });


    it("should mint non-fungible token", async () => {

        const tokenId = await networkClientWrapper.createNFT({
            name: "TokenToMint",
            symbol: "TTM",
            maxSupply: 1000,
        });
        const STARTING_SUPPLY = 0;

        const prompt = {
            user: "user",
            text: `Mint an NFT with metadata "My NFT" to token ${tokenId}`,
        };
       
        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = response[response.length - 1].text.match(
            /https:\/\/hashscan\.io\/[^/]+\/tx\/([\d.]+)@([\d.]+)/
        );
        await wait(5000);

        const tokenInfo =
            await hederaApiClient.getTokenDetails(tokenId);


        expect(Number(tokenInfo.total_supply)).toBe(STARTING_SUPPLY + 1);
        expect(hashScanLinkMatch).toBeTruthy();
    });
});