"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeerFunction = exports.addPeerFunction = void 0;
const __1 = require("..");
const redisClient_1 = __importDefault(require("../redis/redisClient"));
const executeCommand_utils_1 = require("./executeCommand.utils");
// Helper function for adding peer to WireGuard
const addPeerFunction = async (clientPublicKey, assignedIP, index, isKubernetes) => {
    try {
        // Validate inputs
        if (!clientPublicKey || !assignedIP || index < 0) {
            throw new Error("Invalid input provided to addPeerFunction");
        }
        const command = `${isKubernetes ? `kubectl exec wireguard-${index} ` : ""}wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        // Save to Redis
        if (__1.ISKUBERNETES === "true") {
            await redisClient_1.default.set(clientPublicKey, index);
            console.log(`Added peer: ${clientPublicKey}, IP: ${assignedIP}, Index: ${index}`);
        }
        else {
            console.log(`Added peer: ${clientPublicKey}, IP: ${assignedIP}`);
        }
    }
    catch (error) {
        console.error("Error in addPeerFunction:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.addPeerFunction = addPeerFunction;
// Helper function for removing peer from WireGuard
const removePeerFunction = async (clientPublicKey, index, isKubernetes) => {
    try {
        // Validate inputs
        if (!clientPublicKey || index < 0) {
            throw new Error("Invalid input provided to removePeerFunction");
        }
        const command = `${isKubernetes ? `kubectl exec wireguard-${index} ` : ""}wg set wg0 peer ${clientPublicKey} remove`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        // Remove from Redis
        if (__1.ISKUBERNETES === "true") {
            await redisClient_1.default.del(clientPublicKey);
            console.log(`Removed peer: ${clientPublicKey}, Index: ${index}`);
        }
        else {
            console.log(`Removed peer: ${clientPublicKey}`);
        }
    }
    catch (error) {
        console.error("Error in removePeerFunction:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.removePeerFunction = removePeerFunction;
