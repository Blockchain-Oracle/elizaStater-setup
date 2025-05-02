"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopicParamsSchema = void 0;
const zod_1 = require("zod");
exports.createTopicParamsSchema = zod_1.z.object({
    memo: zod_1.z.string(),
    isSubmitKey: zod_1.z.coerce.boolean(),
});
