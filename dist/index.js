"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolManager = exports.CONFIG_PATH = exports.PUBLIC_KEY_PATH = exports.PRIVATE_KEY_PATH = exports.ISKUBERNETES = exports.ADDRESS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const ipPoolManager_1 = require("./ipPoolManager");
const keys_utils_1 = require("./utils/keys.utils");
const wireguardConfig_utils_1 = require("./utils/wireguardConfig.utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Load environment variables from .env file
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
exports.ADDRESS = process.env.ADDRESS || "10.8.0.0/24";
exports.ISKUBERNETES = process.env.ISKUBERNETES || "false";
// WireGuard Configuration Paths
exports.PRIVATE_KEY_PATH = "/etc/wireguard/private.key";
exports.PUBLIC_KEY_PATH = "/etc/wireguard/public.key";
exports.CONFIG_PATH = "/etc/wireguard/wg0.conf";
// IP Pool Manager Instance
exports.poolManager = (0, ipPoolManager_1.createIPPoolManager)(exports.ADDRESS);
// API Endpoints
const peer_route_1 = __importDefault(require("./routes/peer.route"));
app.use("/api/peer", peer_route_1.default);
app.listen(PORT, async () => {
    try {
        console.log(`Server is running on ${PORT}`);
        console.log(`ISKUBERNETES: ${exports.ISKUBERNETES}`);
        if (exports.ISKUBERNETES === "false") {
            const { privateKey, publicKey } = await (0, keys_utils_1.generateKeys)();
            await (0, keys_utils_1.saveKeys)(privateKey, publicKey);
            await (0, wireguardConfig_utils_1.createConfigFile)(privateKey);
            await (0, wireguardConfig_utils_1.setupWireGuardInterface)();
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Initialization error:", error.message);
        }
    }
});
app.get("/", (_req, res) => {
    res.status(200).send("Welcome to the WireGuard Server!");
});
