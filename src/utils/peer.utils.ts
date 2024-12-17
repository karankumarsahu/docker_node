import redisClient from "../redis/redisClient";
import { executeCommand } from "./executeCommand.utils";

// Add peer in Kubernetes environment
export const addPeerWithKubernetes = async (
  clientPublicKey: string,
  assignedIP: string,
  index: number
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || !assignedIP || index < 0) {
      throw new Error("Invalid input provided to addPeerWithKubernetes");
    }

    const command = `kubectl exec wireguard-${index} -- wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    // Save to Redis
    await redisClient.set(clientPublicKey, index);
    console.log(`Added peer (Kubernetes): ${clientPublicKey}, IP: ${assignedIP}, Index: ${index}`);
  } catch (error) {
    console.error("Error in addPeerWithKubernetes:", error instanceof Error ? error.message : error);
    throw error;
  }
};

// Add peer in non-Kubernetes environment
export const addPeerWithoutKubernetes = async (
  clientPublicKey: string,
  assignedIP: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || !assignedIP) {
      throw new Error("Invalid input provided to addPeerWithoutKubernetes");
    }

    const command = `wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    console.log(`Added peer (Non-Kubernetes): ${clientPublicKey}, IP: ${assignedIP}`);
  } catch (error) {
    console.error("Error in addPeerWithoutKubernetes:", error instanceof Error ? error.message : error);
    throw error;
  }
};

// Remove peer in Kubernetes environment
export const removePeerWithKubernetes = async (
  clientPublicKey: string,
  index: number
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || index < 0) {
      throw new Error("Invalid input provided to removePeerWithKubernetes");
    }

    const command = `kubectl exec wireguard-${index} -- wg set wg0 peer ${clientPublicKey} remove`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    // Remove from Redis
    await redisClient.del(clientPublicKey);
    console.log(`Removed peer (Kubernetes): ${clientPublicKey}, Index: ${index}`);
  } catch (error) {
    console.error("Error in removePeerWithKubernetes:", error instanceof Error ? error.message : error);
    throw error;
  }
};

// Remove peer in non-Kubernetes environment
export const removePeerWithoutKubernetes = async (
  clientPublicKey: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey) {
      throw new Error("Invalid input provided to removePeerWithoutKubernetes");
    }

    const command = `wg set wg0 peer ${clientPublicKey} remove`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    console.log(`Removed peer (Non-Kubernetes): ${clientPublicKey}`);
  } catch (error) {
    console.error("Error in removePeerWithoutKubernetes:", error instanceof Error ? error.message : error);
    throw error;
  }
};

