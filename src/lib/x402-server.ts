/**
 * Shared x402 Resource Server Configuration
 * 
 * This module provides the x402ResourceServer instance that's used
 * across all payment-gated API routes.
 */

console.log("Loading x402-server configuration...");

import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { bazaarResourceServerExtension, declareDiscoveryExtension } from "@x402/extensions/bazaar";

// Network configuration
// Base Sepolia = eip155:84532
// Base Mainnet = eip155:8453
export const network = process.env.X402_NETWORK === "base" ? "eip155:8453" : "eip155:84532";

// CDP Facilitator URL for payment verification and settlement
const facilitatorUrl = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";

// Server wallet address for receiving payments
export const payToAddress = process.env.SERVER_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";

// Initialize the facilitator client with public URL
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

// Create the shared resource server with EVM scheme support
export const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(network, new ExactEvmScheme())
    .registerExtension(bazaarResourceServerExtension);
