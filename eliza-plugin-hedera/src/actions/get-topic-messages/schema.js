"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaGetTopicMessagesParamsSchema = void 0;
const zod_1 = require("zod");
const utils_ts_1 = require("../../shared/utils.ts");
exports.hederaGetTopicMessagesParamsSchema = zod_1.z.object({
    topicId: zod_1.z.string(),
    lowerThreshold: zod_1.z.string().nullable().transform(utils_ts_1.castToNull),
    upperThreshold: zod_1.z.string().nullable().transform(utils_ts_1.castToNull),
});
