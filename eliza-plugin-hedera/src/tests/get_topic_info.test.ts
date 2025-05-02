import { describe, expect, it, beforeAll } from "vitest";
import { ElizaOSApiClient } from "./utils/elizaApiClient";
import { ElizaOSPrompt, NetworkType } from "./types";
import * as dotenv from "dotenv";
import { NetworkClientWrapper } from "./utils/testnetClient";
import { HederaMirrorNodeClient } from "./utils/hederaMirrorNodeClient";
import { hashscanTopicLinkMatcher } from "./utils/utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseTopicInfo(text: string) {
  const lines = text.split('\n');
  const result: Record<string, string> = {};
  let currentKey: string | null = null;
  
  lines.forEach(line => {
      if (line.startsWith('----')) return;
      
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      if (trimmedLine.endsWith(':')) {
          currentKey = trimmedLine.slice(0, -1).toLowerCase().replace(/\s+/g, '_');
          return;
      }
      
      if (line.startsWith('   ') && currentKey) {
          if (trimmedLine.startsWith('type:')) {
              result[`${currentKey}_type`] = trimmedLine.split(':')[1].trim();
          } else {
              result[currentKey] = trimmedLine;
          }
          return;
      }
      
      if (trimmedLine.includes(':')) {
          const [key, ...valueParts] = trimmedLine.split(':');
          const value = valueParts.join(':').trim();
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
          result[normalizedKey] = value;
          currentKey = null;
      }
  });
  
  return result;
}

function convertTimestampToDate(timestamp: { from: string | null, to: string | null }) {
  return {
      from: timestamp.from ? new Date(Number(timestamp.from) * 1000).toISOString() : null,
      to: timestamp.to ? new Date(Number(timestamp.to) * 1000).toISOString() : null
  };
}


dotenv.config();
describe("get_topic_info", () => {
    let topic1: string;
    let topic2: string;
    let topic3: string;
    let elizaOsApiClient: ElizaOSApiClient;
    let testCases: { textPrompt: string; topicId: string; }[];
    let networkClientWrapper: NetworkClientWrapper;
    const hederaMirrorNodeClient = new HederaMirrorNodeClient(
        process.env.HEDERA_NETWORK_TYPE as NetworkType
    );

    beforeAll(async () => {
        try {
            networkClientWrapper = new NetworkClientWrapper(
                process.env.HEDERA_ACCOUNT_ID!,
                process.env.HEDERA_PRIVATE_KEY!,
                process.env.HEDERA_KEY_TYPE!,
                "testnet"
            );

            await Promise.all([
                networkClientWrapper.createTopic("Hello world 1", true),
                networkClientWrapper.createTopic("Hello world 2", true),
                networkClientWrapper.createTopic("Hello world 3", true),
            ]).then(([_topic1, _topic2, _topic3]) => {
                topic1 = _topic1.topicId;
                topic2 = _topic2.topicId;
                topic3 = _topic3.topicId;
            });

            await wait(5000);

            testCases = [
                {
                    textPrompt: `Give me the info for topic ${topic1}`,
                    topicId: topic1,
                },
                {
                    textPrompt: `Give me the details about topic ${topic2}`,
                    topicId: topic2,
                },
                {
                    textPrompt: `I'd like to see the status of topic ${topic3}`,
                    topicId: topic3,
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

    describe("get topic info checks", () => {
        it("should get topic info", async () => {
            for (const { textPrompt } of testCases) {
                const prompt: ElizaOSPrompt = {
                    user: "user",
                    text: textPrompt,
                };

                const response = await elizaOsApiClient.sendPrompt(prompt);
                const hashScanLinkMatch = hashscanTopicLinkMatcher(response[response.length - 1].text);
                await wait(5000);

                const topicInfo = response[response.length - 1].text;
                const parsedTopicInfo = parseTopicInfo(topicInfo);
                const topicId = parsedTopicInfo.link.split('/').pop() ?? '';
                const mirrorNodeTopicInfo = await hederaMirrorNodeClient.getTopic(topicId);
                const topicTimestamp = convertTimestampToDate(mirrorNodeTopicInfo.timestamp);

                expect(topicId).toBe(mirrorNodeTopicInfo.topic_id);
                expect(parsedTopicInfo.memo).toBe(mirrorNodeTopicInfo.memo);
                expect(parsedTopicInfo.admin_key).toBe(mirrorNodeTopicInfo.admin_key.key);
                expect(parsedTopicInfo.admin_key_type).toBe(mirrorNodeTopicInfo.admin_key._type);
                expect(parsedTopicInfo.creation_time.split('.')[0] + 'Z').toBe(String(topicTimestamp.from).split('.')[0] + 'Z');
                expect(parsedTopicInfo.expiration_time.split('.')[0] + 'Z').toBe(String(topicTimestamp.to).split('.')[0] + 'Z');
                expect(hashScanLinkMatch).toBeTruthy();

            }
        });
    });
});