import { Request, Response } from "express";
import { ISKUBERNETES, poolManager, PUBLIC_KEY_PATH } from "../index";
import { getRandomIndex } from "../utils/getRandomIndex.utils";
import { addPeerFunction, removePeerFunction } from "../utils/peer.utils";
import { promises as fs } from "fs";





export const addPeer = async (req: Request, res: Response): Promise<any> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    return res.status(400).json({ error: "clientPublicKey is required" });
  }

  try {
    const assignedIP = poolManager.assignIP(clientPublicKey);

    // Check if assignedIP is null and return an error if it is
    if (assignedIP === null) {
      return res.status(500).json({ error: "No available IPs" });
    }

    const index = await getRandomIndex()
    
     const randomPorts = "51820" + index;


    if (assignedIP) {
      console.log("Assigned IP:", assignedIP);
      await addPeerFunction(
        clientPublicKey,
        assignedIP,
        index,
        ISKUBERNETES
      );
    } else {
      console.log("No available IPs");
    }

    const serverPublicKey = await fs.readFile(PUBLIC_KEY_PATH, "utf-8");

    res.status(200).json({
      message: "Peer added successfully",
      assignedIP,
      randomPorts,
      serverPublicKey: serverPublicKey.trim(),
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      console.error("Add Peer Error:", error);
    }
  }
};

export const removePeer = async (req: Request, res: Response): Promise<any> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    return res.status(400).json({ error: "clientPublicKey is required" });
  }

  try {
    // Remove peer from WireGuard
    await removePeerFunction(
      clientPublicKey,
      await getRandomIndex(),
      ISKUBERNETES
    );

    // Remove peer from IP pool
    const success = poolManager.removePeer(clientPublicKey);

    if (success) {
      console.log(`Peer ${clientPublicKey} removed successfully`);
      res.status(200).json({ message: "Peer removed successfully" });
    } else {
      res.status(404).json({ error: "Peer not found" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      console.error("Remove Peer Error:", error);
    }
  }
};
