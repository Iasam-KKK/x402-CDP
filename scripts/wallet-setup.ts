/**
 * CDP Server Wallet Setup Script
 * 
 * This script creates a new EVM wallet using the Coinbase Developer Platform SDK.
 * The wallet will be used to receive x402 payments on Base Sepolia/Base Mainnet.
 * 
 * Usage: npm run wallet:setup
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as crypto from "crypto";
import { CdpClient } from "@coinbase/cdp-sdk";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function createServerWallet() {
    console.log("\n🔐 CDP Server Wallet Setup\n");
    console.log("=".repeat(50));

    // Validate required environment variables
    if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
        console.error("❌ Error: CDP_API_KEY_ID and CDP_API_KEY_SECRET are required");
        console.error("   Get your API keys from: https://portal.cdp.coinbase.com/");
        process.exit(1);
    }

    // Check for wallet secret or generate one
    let walletSecret = process.env.CDP_WALLET_SECRET;
    let generatedNewSecret = false;

    if (!walletSecret || walletSecret.trim() === "") {
        // Generate a new wallet secret (32 bytes = 256 bits, hex encoded = 64 chars)
        walletSecret = crypto.randomBytes(32).toString("hex");
        generatedNewSecret = true;
        console.log("\n⚠️  No CDP_WALLET_SECRET found. Generating a new one...");
    }

    try {
        // Initialize CDP client
        console.log("\n📡 Connecting to Coinbase Developer Platform...");

        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_ID,
            apiKeySecret: process.env.CDP_API_KEY_SECRET,
            walletSecret: walletSecret,
        });

        // Create EVM account (supports Base)
        console.log("🔨 Creating new EVM wallet account...");
        const account = await cdp.evm.createAccount();

        console.log("\n✅ Wallet created successfully!\n");
        console.log("=".repeat(50));
        console.log("\n📋 Add these to your .env.local file:\n");
        console.log(`SERVER_WALLET_ADDRESS=${account.address}`);

        if (generatedNewSecret) {
            console.log(`CDP_WALLET_SECRET=${walletSecret}`);
            console.log("\n⚠️  IMPORTANT: Save the CDP_WALLET_SECRET above!");
            console.log("   You need this secret to access the wallet in the future.");
        }

        console.log("\n" + "=".repeat(50));
        console.log("\n📝 Wallet Details:");
        console.log(`   Address: ${account.address}`);
        console.log(`   Network: Base Sepolia (eip155:84532)`);
        console.log("\n💡 Next Steps:");
        console.log("   1. Copy the values above to your .env.local");
        console.log("   2. Get testnet USDC from a faucet for testing");
        console.log("   3. Run 'npm run dev' to start the marketplace");
        console.log("\n🔗 Useful Links:");
        console.log("   - Base Sepolia Faucet: https://www.coinbase.com/faucets/base-sepolia");
        console.log("   - CDP Portal: https://portal.cdp.coinbase.com/");
        console.log("   - x402 Docs: https://docs.cdp.coinbase.com/x402/\n");

        return account.address;
    } catch (error) {
        console.error("\n❌ Failed to create wallet:", error);

        if (error instanceof Error) {
            if (error.message.includes("unauthorized") || error.message.includes("401")) {
                console.error("\n💡 Tip: Check your CDP API credentials in .env.local");
            } else if (error.message.includes("Wallet Secret")) {
                console.error("\n💡 Tip: Make sure CDP_WALLET_SECRET is set in .env.local");
            }
        }

        process.exit(1);
    }
}

// Run the script
createServerWallet();
