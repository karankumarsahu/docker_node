import { ISKUBERNETES } from "..";
import redisClient from "../redis/redisClient";
import { executeCommand } from "./executeCommand.utils";

// Helper function for adding peer to WireGuard
export const addPeerFunction = async (
  clientPublicKey: string,
  assignedIP: string,
  index: number,
  isKubernetes: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || !assignedIP || index < 0) {
      throw new Error("Invalid input provided to addPeerFunction");
    }

    const command = `${
      isKubernetes ? `kubectl exec wireguard-${index} ` : ""
    }wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    // Save to Redis
    if (ISKUBERNETES === "true") {
      await redisClient.set(clientPublicKey, index);
      console.log(
        `Added peer: ${clientPublicKey}, IP: ${assignedIP}, Index: ${index}`
      );
    } else {
      console.log(`Added peer: ${clientPublicKey}, IP: ${assignedIP}`);
    }
  } catch (error) {
    console.error(
      "Error in addPeerFunction:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};

// Helper function for removing peer from WireGuard
export const removePeerFunction = async (
  clientPublicKey: string,
  index: number,
  isKubernetes: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || index < 0) {
      throw new Error("Invalid input provided to removePeerFunction");
    }

    const command = `${
      isKubernetes ? `kubectl exec wireguard-${index} ` : ""
    }wg set wg0 peer ${clientPublicKey} remove`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    // Remove from Redis
    if (ISKUBERNETES === "true") {
      await redisClient.del(clientPublicKey);
      console.log(`Removed peer: ${clientPublicKey}, Index: ${index}`);
    } else {
      console.log(`Removed peer: ${clientPublicKey}`);
    }
  } catch (error) {
    console.error(
      "Error in removePeerFunction:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};
