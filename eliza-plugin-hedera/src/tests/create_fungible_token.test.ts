import { describe, expect, it, beforeEach } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt } from "./types";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import * as dotenv from "dotenv";
import { fromDisplayToBaseUnit, hashscanLinkMatcher } from "./utils/utils";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractTokenId = (text: string) => {
    const regex = /Token ID:\s*(\d+\.\d+\.\d+)/;
    const match = text.match(regex);

    if (match) {
        const tokenId = match[1]; // Extracted Token ID
        console.log(`Extracted token id: ${tokenId}`);
        return tokenId;
    } else {
        throw new Error("No match for token ID was found in ElizaOS response.");
    }
};

describe("create_fungible_token", () => {
    beforeEach(async () => {
        dotenv.config();
        await wait(3000);
    });
    it("Create token with all possible parameters", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const hederaApiClient = new HederaMirrorNodeClient("testnet");

        const promptText =
            "Create token GameGold with symbol GG, 2 decimal places, and starting supply of 750000. Set memo to 'This is an example memo' and token metadata to 'And that's an example metadata'. Add supply key, admin key. Set metadata key.";
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: promptText,
        };

        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = response[response.length - 1].text.match(
            /https:\/\/hashscan\.io\/[^/]+\/tx\/([\d.]+)@([\d.]+)/
        );
        const tokenId = extractTokenId(response[response.length - 1].text);

        await wait(5000);

        const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

        expect(tokenDetails.symbol).toEqual("GG");
        expect(tokenDetails.name).toEqual("GameGold");
        expect(tokenDetails.decimals).toEqual("2");
        expect(tokenDetails.initial_supply).toEqual(
            fromDisplayToBaseUnit(750000, 2).toString()
        );
        expect(tokenDetails.memo).toEqual("This is an example memo");
        expect(atob(tokenDetails.metadata!)).toEqual(
            "And that's an example metadata"
        );
        expect(tokenDetails?.supply_key?.key).not.toBeFalsy();
        expect(tokenDetails?.admin_key?.key).not.toBeFalsy();
        expect(tokenDetails?.metadata_key?.key).not.toBeFalsy();
        expect(hashScanLinkMatch).toBeTruthy();
    });

    it("Create token with minimal parameters", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const hederaApiClient = new HederaMirrorNodeClient("testnet");

        const promptText =
            "Create token Minimal Token with symbol MT, 3 decimal places, and starting supply of 333.";
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: promptText,
        };

        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = response[response.length - 1].text.match(
            /https:\/\/hashscan\.io\/[^/]+\/tx\/([\d.]+)@([\d.]+)/
        );
        const tokenId = extractTokenId(response[response.length - 1].text);

        await wait(5000);

        const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

        expect(tokenDetails.symbol).toEqual("MT");
        expect(tokenDetails.name).toEqual("Minimal Token");
        expect(tokenDetails.decimals).toEqual("3");
        expect(tokenDetails.initial_supply).toEqual(
            fromDisplayToBaseUnit(333, 3).toString()
        );
        expect(tokenDetails.memo).toBe("");
        expect(tokenDetails.metadata).toBe("");
        expect(tokenDetails?.supply_key?.key).toBeUndefined();
        expect(tokenDetails?.admin_key?.key).toBeUndefined();
        expect(tokenDetails?.metadata_key?.key).toBeUndefined();
        expect(hashScanLinkMatch).toBeTruthy();
    });

    it("Create token with minimal parameters plus memo", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const hederaApiClient = new HederaMirrorNodeClient("testnet");

        const promptText =
            "Create token 'Minimal Plus Memo Token' with symbol MPMT, 4 decimal places, and starting supply of 444. Set memo to 'Automatic tests memo'";
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: promptText,
        };

        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = hashscanLinkMatcher(response[response.length - 1].text);

        const tokenId = extractTokenId(response[response.length - 1].text);

        await wait(5000);

        const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

        expect(tokenDetails.symbol).toEqual("MPMT");
        expect(tokenDetails.name).toEqual("Minimal Plus Memo Token");
        expect(tokenDetails.decimals).toEqual("4");
        expect(tokenDetails.initial_supply).toEqual(
            fromDisplayToBaseUnit(444, 4).toString()
        );
        expect(tokenDetails.memo).toEqual("Automatic tests memo");
        expect(tokenDetails.metadata).toBe("");
        expect(tokenDetails?.supply_key?.key).toBeUndefined();
        expect(tokenDetails?.admin_key?.key).toBeUndefined();
        expect(tokenDetails?.metadata_key?.key).toBeUndefined();
        expect(hashScanLinkMatch).toBeTruthy();
    });

    it("Create token with minimal parameters plus metadata key", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const hederaApiClient = new HederaMirrorNodeClient("testnet");

        const promptText =
            "Create token 'Minimal Plus Metadata Key Token' with symbol MPMKT, 5 decimal places, and starting supply of 555. Set metadata key to agents key.";
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: promptText,
        };

        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = response[response.length - 1].text.match(
            /https:\/\/hashscan\.io\/[^/]+\/tx\/([\d.]+)@([\d.]+)/
        );
        const tokenId = extractTokenId(response[response.length - 1].text);

        await wait(5000);

        const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

        expect(tokenDetails.symbol).toEqual("MPMKT");
        expect(tokenDetails.name).toEqual("Minimal Plus Metadata Key Token");
        expect(tokenDetails.decimals).toEqual("5");
        expect(tokenDetails.initial_supply).toEqual(
            fromDisplayToBaseUnit(555, 5).toString()
        );
        expect(tokenDetails.memo).toBe("");
        expect(tokenDetails.metadata).toBe("");
        expect(tokenDetails?.supply_key?.key).toBeUndefined();
        expect(tokenDetails?.admin_key?.key).toBeUndefined();
        expect(tokenDetails?.metadata_key?.key).not.toBeUndefined();
        expect(hashScanLinkMatch).toBeTruthy();
    });

    it("Create token with minimal parameters plus admin key and supply key", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const hederaApiClient = new HederaMirrorNodeClient("testnet");

        const promptText =
            "Create token 'Minimal Plus Admin Supply Keys Token' with symbol MPASKT, 1 decimal places, and starting supply of 111. Set admin key and supply keys.";
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: promptText,
        };

        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = response[response.length - 1].text.match(
            /https:\/\/hashscan\.io\/[^/]+\/tx\/([\d.]+)@([\d.]+)/
        );
        const tokenId = extractTokenId(response[response.length - 1].text);

        await wait(5000);

        const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

        expect(tokenDetails.symbol).toEqual("MPASKT");
        expect(tokenDetails.name).toEqual(
            "Minimal Plus Admin Supply Keys Token"
        );
        expect(tokenDetails.decimals).toEqual("1");
        expect(tokenDetails.initial_supply).toEqual(
            fromDisplayToBaseUnit(111, 1).toString()
        );
        expect(tokenDetails.memo).toBe("");
        expect(tokenDetails.memo).toBe("");
        expect(tokenDetails?.supply_key?.key).not.toBeUndefined();
        expect(tokenDetails?.admin_key?.key).not.toBeUndefined();
        expect(tokenDetails?.metadata_key?.key).toBeUndefined();
        expect(hashScanLinkMatch).toBeTruthy();
    });

    it("Create token with minimal parameters plus admin key and supply key and memo and metadata", async () => {
        const elizaOsApiClient = new ElizaOSApiClient(
            `http://${process.env.ELIZAOS_REST_HOSTNAME}:${process.env.ELIZAOS_REST_PORT}`
        );
        await elizaOsApiClient.setup();
        const hederaApiClient = new HederaMirrorNodeClient("testnet");

        const promptText =
            "Create token 'Complex Token' with symbol CPLXT, 1 decimal places, and starting supply of 1111. Set admin key and supply keys. Set memo to 'This a complex token'. Set metadata to 'this could be a link to image'";
        const prompt: ElizaOSPrompt = {
            user: "user",
            text: promptText,
        };

        const response = await elizaOsApiClient.sendPrompt(prompt);
        const hashScanLinkMatch = response[response.length - 1].text.match(
            /https:\/\/hashscan\.io\/[^/]+\/tx\/([\d.]+)@([\d.]+)/
        );
        const tokenId = extractTokenId(response[response.length - 1].text);

        await wait(5000);

        const tokenDetails = await hederaApiClient.getTokenDetails(tokenId);

        expect(tokenDetails.symbol).toEqual("CPLXT");
        expect(tokenDetails.name).toEqual("Complex Token");
        expect(tokenDetails.decimals).toEqual("1");
        expect(tokenDetails.initial_supply).toEqual(
            fromDisplayToBaseUnit(1111, 1).toString()
        );
        expect(tokenDetails.memo).toBe("This a complex token");
        expect(atob(tokenDetails.metadata!)).toBe(
            "this could be a link to image"
        );
        expect(tokenDetails?.supply_key?.key).not.toBeUndefined();
        expect(tokenDetails?.admin_key?.key).not.toBeUndefined();
        expect(tokenDetails?.metadata_key?.key).toBeUndefined();
        expect(hashScanLinkMatch).toBeTruthy();
    });
});
