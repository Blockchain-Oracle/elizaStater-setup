"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaSubmitTopicMessageParamsSchema = void 0;
const zod_1 = require("zod");
exports.hederaSubmitTopicMessageParamsSchema = zod_1.z.object({
    topicId: zod_1.z.string(),
    message: zod_1.z.string(),
});
