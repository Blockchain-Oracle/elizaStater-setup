"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBaseUnitSync = exports.castToEmptyString = exports.castToNull = exports.castToBoolean = exports.generateHashscanUrl = void 0;
exports.convertTimestampToUTC = convertTimestampToUTC;
exports.convertStringToTimestamp = convertStringToTimestamp;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const zod_1 = require("zod");
function convertTimestampToUTC(timestamp) {
    const [seconds, nanos] = timestamp.split(".").map(Number);
    const milliseconds = Math.round(nanos / 1000000); // Convert nanoseconds to milliseconds
    return new Date(seconds * 1000 + milliseconds).toISOString();
}
const generateHashscanUrl = (txHash, networkType) => {
    return `https://hashscan.io/${networkType}/tx/${txHash}`;
};
exports.generateHashscanUrl = generateHashscanUrl;
function convertStringToTimestamp(input) {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    const timestamp = date.getTime();
    return parseFloat((timestamp / 1000).toFixed(6));
}
// Custom preprocess to handle string "true"/"false" to boolean values
exports.castToBoolean = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        if (val.toLowerCase() === 'true')
            return true;
        if (val.toLowerCase() === 'false')
            return false;
        else
            return false; // false is default
    }
    return val; // Return the value as is if it's not a string
}, zod_1.z.boolean());
// Custom preprocess to handle LLMs extracting mistakes
// Sometimes null values are returned as strings and require parsing
const castToNull = (value) => (value === "null" ? null : value);
exports.castToNull = castToNull;
const castToEmptyString = (value) => (value === "null" ? "" : value);
exports.castToEmptyString = castToEmptyString;
const toBaseUnitSync = (decimalsString, value) => {
    const decimals = new bignumber_js_1.default(decimalsString);
    const divisor = new bignumber_js_1.default(10).pow(decimals);
    const bigValue = bignumber_js_1.default.isBigNumber(value) ? value : new bignumber_js_1.default(value);
    return bigValue.dividedBy(divisor);
};
exports.toBaseUnitSync = toBaseUnitSync;
