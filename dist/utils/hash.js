"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.createId = createId;
const crypto_1 = require("crypto");
function sha256(text) {
    return (0, crypto_1.createHash)("sha256").update(text, "utf8").digest("hex");
}
function createId() {
    return (0, crypto_1.randomUUID)();
}
//# sourceMappingURL=hash.js.map