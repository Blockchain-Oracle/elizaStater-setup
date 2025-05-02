"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopicParamsSchema = void 0;
const zod_1 = require("zod");
exports.deleteTopicParamsSchema = zod_1.z.object({
    topicId: zod_1.z.string(),
});
