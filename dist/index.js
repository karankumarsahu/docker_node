"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolManager = exports.CONFIG_PATH = exports.PUBLIC_KEY_PATH = exports.PRIVATE_KEY_PATH = exports.ISKUBERNETES = exports.ADDRESS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const ipPoolManager_1 = require("./ipPoolManager");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Load environment variables from .env file
dotenv_1.default.config();
// const PORT = process.env.PORT || 8000;
exports.ADDRESS = process.env.ADDRESS || "10.8.0.0/24";
exports.ISKUBERNETES = process.env.ISKUBERNETES || "false";
// WireGuard Configuration Paths
exports.PRIVATE_KEY_PATH = "/etc/wireguard/private.key";
exports.PUBLIC_KEY_PATH = "/etc/wireguard/public.key";
exports.CONFIG_PATH = "/etc/wireguard/wg0.conf";
// IP Pool Manager Instance
exports.poolManager = (0, ipPoolManager_1.createIPPoolManager)(exports.ADDRESS + "/24");
// API Endpoints
const peer_route_1 = __importDefault(require("./routes/peer.route"));
app.use("/api/peer", peer_route_1.default);
// app.listen(PORT, async () => {
//   try {
//     console.log(`Server is running on ${PORT}`);
//     console.log(`ISKUBERNETES: ${ISKUBERNETES}`);
//     if (ISKUBERNETES === "false") {
//       const { privateKey, publicKey } = await generateKeys();
//       await saveKeys(privateKey, publicKey);
//       await createConfigFile(privateKey);
//       await setupWireGuardInterface();
//     }
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Initialization error:", error.message);
//     }
//   }
// });
// app.get("/", (_req, res) => {
//   res.status(200).send("Welcome to the WireGuard Server!");
// });
const dgram_1 = __importDefault(require("dgram"));
// Create a UDP socket
const server = dgram_1.default.createSocket("udp4");
const PORT = 51820;
// Event: Socket is ready to receive messages
server.on("listening", () => {
    const address = server.address();
    console.log(`UDP server is listening on ${address.address}:${address.port}`);
});
// Event: Received a message
server.on("message", (msg, rinfo) => {
    console.log(`Message received: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // Reply to the client
    const response = `Received your message: ${msg}`;
    server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err)
            console.error("Error sending response:", err);
    });
});
// Event: Error handling
server.on("error", (err) => {
    console.error(`Server error:\n${err.stack}`);
    server.close();
});
// Event: Close the socket
server.on("close", () => {
    console.log("Server closed");
});
// Bind the server to the port
server.bind(PORT, "0.0.0.0", () => {
    console.log(`Server bound to port ${PORT}`);
});
