import { Request, Response } from "express";
import { ISKUBERNETES, poolManager, PUBLIC_KEY_PATH } from "../index";
import { getRandomIndex } from "../utils/getRandomIndex.utils";
import { addPeerFunction, removePeerFunction } from "../utils/peer.utils";
import { promises as fs } from "fs";

/**
 * Add a peer to the WireGuard server and IP pool.
 */
export const addPeer = async (req: Request, res: Response): Promise<void> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    res.status(400).json({ error: "clientPublicKey is required" });
    return;
  }

  try {
    const assignedIP = poolManager.assignIP(clientPublicKey);

    if (!assignedIP) {
      res.status(500).json({ error: "No available IPs" });
      return;
    }

    console.log("Assigned IP:", assignedIP);

    let randomPort: string | undefined;

    if (ISKUBERNETES === "true") {
      const index = await getRandomIndex();
      randomPort = `51820${index}`;
      await addPeerFunction(clientPublicKey, assignedIP, index, ISKUBERNETES);
    } else {
      await addPeerFunction(clientPublicKey, assignedIP, -1, ISKUBERNETES);
    }

    const serverPublicKey = await fs.readFile(PUBLIC_KEY_PATH, "utf-8");

    res.status(200).json({
      message: "Peer added successfully",
      assignedIP,
      serverPublicKey: serverPublicKey.trim(),
      ...(ISKUBERNETES === "true" && { randomPort }),
    });
  } catch (error) {
    console.error("Add Peer Error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Failed to add peer" });
  }
};

/**
 * Remove a peer from the WireGuard server and IP pool.
 */
export const removePeer = async (req: Request, res: Response): Promise<void> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    res.status(400).json({ error: "clientPublicKey is required" });
    return;
  }

  try {
    const index = ISKUBERNETES === "true" ? await getRandomIndex() : undefined;

    // Remove peer from WireGuard
    await removePeerFunction(clientPublicKey, index, ISKUBERNETES);

    // Remove peer from IP pool
    const success = poolManager.removePeer(clientPublicKey);

    if (success) {
      console.log(`Peer ${clientPublicKey} removed successfully`);
      res.status(200).json({ message: "Peer removed successfully" });
    } else {
      res.status(404).json({ error: "Peer not found" });
    }
  } catch (error) {
    console.error("Remove Peer Error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Failed to remove peer" });
  }
};
