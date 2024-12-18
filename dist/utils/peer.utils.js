"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeerWithoutKubernetes = exports.removePeerWithKubernetes = exports.addPeerWithoutKubernetes = exports.addPeerWithKubernetes = void 0;
const redisClient_1 = __importDefault(require("../redis/redisClient"));
const executeCommand_utils_1 = require("./executeCommand.utils");
// Add peer in Kubernetes environment
const addPeerWithKubernetes = async (clientPublicKey, assignedIP, index) => {
    try {
        // Validate inputs
        if (!clientPublicKey || !assignedIP || index < 0) {
            throw new Error("Invalid input provided to addPeerWithKubernetes");
        }
        const command = `kubectl exec wireguard-${index} -- wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        // Save to Redis
        await redisClient_1.default.set(clientPublicKey, index);
        console.log(`Added peer (Kubernetes): ${clientPublicKey}, IP: ${assignedIP}, Index: ${index}`);
    }
    catch (error) {
        console.error("Error in addPeerWithKubernetes:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.addPeerWithKubernetes = addPeerWithKubernetes;
// Add peer in non-Kubernetes environment
const addPeerWithoutKubernetes = async (clientPublicKey, assignedIP) => {
    try {
        // Validate inputs
        if (!clientPublicKey || !assignedIP) {
            throw new Error("Invalid input provided to addPeerWithoutKubernetes");
        }
        const command = `wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        console.log(`Added peer (Non-Kubernetes): ${clientPublicKey}, IP: ${assignedIP}`);
    }
    catch (error) {
        console.error("Error in addPeerWithoutKubernetes:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.addPeerWithoutKubernetes = addPeerWithoutKubernetes;
// Remove peer in Kubernetes environment
const removePeerWithKubernetes = async (clientPublicKey, index) => {
    try {
        // Validate inputs
        if (!clientPublicKey || index < 0) {
            throw new Error("Invalid input provided to removePeerWithKubernetes");
        }
        const command = `kubectl exec wireguard-${index} -- wg set wg0 peer ${clientPublicKey} remove`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        // Remove from Redis
        await redisClient_1.default.del(clientPublicKey);
        console.log(`Removed peer (Kubernetes): ${clientPublicKey}, Index: ${index}`);
    }
    catch (error) {
        console.error("Error in removePeerWithKubernetes:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.removePeerWithKubernetes = removePeerWithKubernetes;
// Remove peer in non-Kubernetes environment
const removePeerWithoutKubernetes = async (clientPublicKey) => {
    try {
        // Validate inputs
        if (!clientPublicKey) {
            throw new Error("Invalid input provided to removePeerWithoutKubernetes");
        }
        const command = `wg set wg0 peer ${clientPublicKey} remove`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        console.log(`Removed peer (Non-Kubernetes): ${clientPublicKey}`);
    }
    catch (error) {
        console.error("Error in removePeerWithoutKubernetes:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.removePeerWithoutKubernetes = removePeerWithoutKubernetes;
