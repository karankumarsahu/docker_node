import { Request, Response } from "express";
import { promises as fs } from "fs";
import {
  ISANSIBLE,
  poolManager,
  PUBLIC_KEY_PATH,
  RANDOM_PORT_PATH,
} from "../index";
import { getRandomIndex } from "../utils/getRandomIndex.utils";
import {
  addPeerWithAnsible,
  addPeerWithoutAnsible,
  removePeerWithAnsible,
  removePeerWithoutAnsible,
} from "../utils/peer.utils";

// Helper function to read server public key
const readServerPublicKey = async (): Promise<string> => {
  try {
    const serverPublicKey = await fs.readFile(PUBLIC_KEY_PATH, "utf-8");
    return serverPublicKey.trim();
  } catch (error) {
    throw new Error("Failed to read server public key");
  }
};

const readRandomPorts = async (): Promise<string> => {
  try {
    const randomPorts = await fs.readFile(RANDOM_PORT_PATH, "utf-8");
    return randomPorts.trim();
  } catch (error) {
    throw new Error("Failed to read server public key");
  }
};

// Add Peer Controller
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

    if (ISANSIBLE === "true") {
      // const index = await getRandomIndex();
      // const randomPorts = `5182${index}`;

      const randomPorts = await readRandomPorts();

      await addPeerWithAnsible(clientPublicKey, assignedIP, randomPorts);

      const serverPublicKey = await readServerPublicKey();

      res.status(200).json({
        message: "Peer added successfully",
        assignedIP,
        randomPorts,
        serverPublicKey,
      });
    } else {
      await addPeerWithoutAnsible(clientPublicKey, assignedIP);

      const serverPublicKey = await readServerPublicKey();

      res.status(200).json({
        message: "Peer added successfully",
        assignedIP,
        serverPublicKey,
      });
    }
  } catch (error) {
    console.error("Add Peer Error:", error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : error });
  }
};

// Remove Peer Controller
export const removePeer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    res.status(400).json({ error: "clientPublicKey is required" });
    return;
  }

  try {
    if (ISANSIBLE === "true") {
      const randomPort = await readRandomPorts();
      await removePeerWithAnsible(clientPublicKey, randomPort);
    } else {
      await removePeerWithoutAnsible(clientPublicKey);
    }

    const success = poolManager.removePeer(clientPublicKey);

    if (success) {
      console.log(`Peer ${clientPublicKey} removed successfully`);
      res.status(200).json({ message: "Peer removed successfully" });
    } else {
      res.status(404).json({ error: "Peer not found" });
    }
  } catch (error) {
    console.error("Remove Peer Error:", error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : error });
  }
};
