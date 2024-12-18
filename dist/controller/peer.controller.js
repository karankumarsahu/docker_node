"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeer = exports.addPeer = void 0;
const fs_1 = require("fs");
const index_1 = require("../index");
const getRandomIndex_utils_1 = require("../utils/getRandomIndex.utils");
const peer_utils_1 = require("../utils/peer.utils");
// Helper function to read server public key
const readServerPublicKey = async () => {
    try {
        const serverPublicKey = await fs_1.promises.readFile(index_1.PUBLIC_KEY_PATH, "utf-8");
        return serverPublicKey.trim();
    }
    catch (error) {
        throw new Error("Failed to read server public key");
    }
};
// Add Peer Controller
const addPeer = async (req, res) => {
    const { clientPublicKey } = req.body;
    if (!clientPublicKey) {
        res.status(400).json({ error: "clientPublicKey is required" });
        return;
    }
    try {
        const assignedIP = index_1.poolManager.assignIP(clientPublicKey);
        if (!assignedIP) {
            res.status(500).json({ error: "No available IPs" });
            return;
        }
        if (index_1.ISKUBERNETES === "true") {
            const index = await (0, getRandomIndex_utils_1.getRandomIndex)();
            const randomPorts = `5182${index}`;
            await (0, peer_utils_1.addPeerWithKubernetes)(clientPublicKey, assignedIP, index);
            const serverPublicKey = await readServerPublicKey();
            res.status(200).json({
                message: "Peer added successfully",
                assignedIP,
                randomPorts,
                serverPublicKey,
            });
        }
        else {
            await (0, peer_utils_1.addPeerWithoutKubernetes)(clientPublicKey, assignedIP);
            const serverPublicKey = await readServerPublicKey();
            res.status(200).json({
                message: "Peer added successfully",
                assignedIP,
                serverPublicKey,
            });
        }
    }
    catch (error) {
        console.error("Add Peer Error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : error });
    }
};
exports.addPeer = addPeer;
// Remove Peer Controller
const removePeer = async (req, res) => {
    const { clientPublicKey } = req.body;
    if (!clientPublicKey) {
        res.status(400).json({ error: "clientPublicKey is required" });
        return;
    }
    try {
        if (index_1.ISKUBERNETES === "true") {
            const index = await (0, getRandomIndex_utils_1.getRandomIndex)();
            await (0, peer_utils_1.removePeerWithKubernetes)(clientPublicKey, index);
        }
        else {
            await (0, peer_utils_1.removePeerWithoutKubernetes)(clientPublicKey);
        }
        const success = index_1.poolManager.removePeer(clientPublicKey);
        if (success) {
            console.log(`Peer ${clientPublicKey} removed successfully`);
            res.status(200).json({ message: "Peer removed successfully" });
        }
        else {
            res.status(404).json({ error: "Peer not found" });
        }
    }
    catch (error) {
        console.error("Remove Peer Error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : error });
    }
};
exports.removePeer = removePeer;
