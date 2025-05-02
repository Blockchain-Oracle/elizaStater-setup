"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingAirdropsParams = void 0;
const zod_1 = require("zod");
exports.pendingAirdropsParams = zod_1.z.object({
    accountId: zod_1.z.string().nullable(),
});
