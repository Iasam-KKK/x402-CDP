/**
 * Balance Check Script
 * 
 * Checks the USDC and ETH balance of the server wallet.
 * 
 * Usage: npx tsx scripts/check-balance.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// USDC contract address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

// USDC ABI for balanceOf
const USDC_ABI = [
    {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
] as const;

async function checkBalances() {
    console.log("\nServer Wallet Balance Check\n");
    console.log("=".repeat(50));

    const serverWallet = process.env.SERVER_WALLET_ADDRESS;
    if (!serverWallet) {
        console.error(" Error: SERVER_WALLET_ADDRESS not set in .env.local");
        process.exit(1);
    }

    console.log(`\nServer Wallet: ${serverWallet}`);
    console.log(`Network: Base Sepolia (testnet)\n`);

    try {
        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(),
        });

        // Check ETH balance
        const ethBalance = await publicClient.getBalance({
            address: serverWallet as `0x${string}`,
        });
        console.log(`ETH Balance:  ${formatEther(ethBalance)} ETH`);

        // Check USDC balance
        const usdcBalance = await publicClient.readContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "balanceOf",
            args: [serverWallet as `0x${string}`],
        });
        const usdcFormatted = Number(usdcBalance) / 1e6;
        console.log(`USDC Balance: ${usdcFormatted.toFixed(6)} USDC`);

        console.log("\n" + "=".repeat(50));
        console.log("\nView on Block Explorer:");
        console.log(`   https://sepolia.basescan.org/address/${serverWallet}\n`);

        // Show payment count estimate
        if (usdcBalance > 0) {
            const paymentsReceived = Math.floor(usdcFormatted / 0.001);
            console.log(` Estimated API calls paid: ~${paymentsReceived} (at $0.001 each)\n`);
        }

    } catch (error) {
        console.error(" Error checking balance:", error);
        process.exit(1);
    }
}

// Run the check
checkBalances();
