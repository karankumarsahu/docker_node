import { ADDRESS, CONFIG_PATH } from "../index";
import { promises as fs } from "fs";
import { executeCommand } from "./executeCommand.utils";

// Create WireGuard configuration file
export const createConfigFile = async (privateKey: string): Promise<void> => {
  const configContent = `[Interface]
PrivateKey = ${privateKey}
Address = ${ADDRESS}/24
ListenPort = 51820
SaveConfig = true
PostUp = ufw route allow in on wg0 out on enX0
PostUp = iptables -t nat -I POSTROUTING -o enX0 -j MASQUERADE
PreDown = ufw route delete allow in on wg0 out on enX0
PreDown = iptables -t nat -D POSTROUTING -o enX0 -j MASQUERADE`
;
  await fs.writeFile(CONFIG_PATH, configContent, { mode: 0o600 });
};

// Set up WireGuard interface
export const setupWireGuardInterface = async (): Promise<void> => {
  await executeCommand("wg-quick up wg0");
};