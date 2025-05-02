"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaTopicInfoParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaTopicInfoParamsSchema = zod_1.z.object({
    topicId: zod_1.z.string(),
});
