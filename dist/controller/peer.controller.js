"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeer = exports.addPeer = void 0;
const index_1 = require("../index");
const getRandomIndex_utils_1 = require("../utils/getRandomIndex.utils");
const peer_utils_1 = require("../utils/peer.utils");
const fs_1 = require("fs");
/**
 * Add a peer to the WireGuard server and IP pool.
 */
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
        console.log("Assigned IP:", assignedIP);
        let randomPort;
        if (index_1.ISKUBERNETES === "true") {
            const index = await (0, getRandomIndex_utils_1.getRandomIndex)();
            randomPort = `51820${index}`;
            await (0, peer_utils_1.addPeerFunction)(clientPublicKey, assignedIP, index, index_1.ISKUBERNETES);
        }
        else {
            await (0, peer_utils_1.addPeerFunction)(clientPublicKey, assignedIP, 0, index_1.ISKUBERNETES);
        }
        const serverPublicKey = await fs_1.promises.readFile(index_1.PUBLIC_KEY_PATH, "utf-8");
        res.status(200).json({
            message: "Peer added successfully",
            assignedIP,
            serverPublicKey: serverPublicKey.trim(),
            ...(index_1.ISKUBERNETES === "true" && { randomPort }),
        });
    }
    catch (error) {
        console.error("Add Peer Error:", error instanceof Error ? error.message : error);
        res.status(500).json({ error: "Failed to add peer" });
    }
};
exports.addPeer = addPeer;
/**
 * Remove a peer from the WireGuard server and IP pool.
 */
const removePeer = async (req, res) => {
    const { clientPublicKey } = req.body;
    if (!clientPublicKey) {
        res.status(400).json({ error: "clientPublicKey is required" });
        return;
    }
    try {
        const index = index_1.ISKUBERNETES === "true" ? await (0, getRandomIndex_utils_1.getRandomIndex)() : 0;
        // Remove peer from WireGuard
        await (0, peer_utils_1.removePeerFunction)(clientPublicKey, index, index_1.ISKUBERNETES);
        // Remove peer from IP pool
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
        console.error("Remove Peer Error:", error instanceof Error ? error.message : error);
        res.status(500).json({ error: "Failed to remove peer" });
    }
};
exports.removePeer = removePeer;
