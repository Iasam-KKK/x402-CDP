/**
 * x402 Full Payment Test Script
 * 
 * This script makes an ACTUAL paid API request using x402:
 * 1. Uses the @x402/fetch wrapper to handle payment automatically
 * 2. Signs and sends USDC payment via the facilitator
 * 3. Receives the API response after payment
 * 
 * Usage: npx tsx scripts/test-payment.ts
 * 
 * Required: 
 *   - BUYER_PRIVATE_KEY in .env.local
 *   - USDC balance in your wallet on Base Sepolia
 *   - Dev server running (npm run dev)
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";


dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// USDC contract address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

const USDC_ABI = [
    {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
] as const;

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

async function testFullPayment() {
    console.log("\nx402 Full Payment Test");
    console.log("=".repeat(50));

    // Validate buyer private key
    let buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
    if (!buyerPrivateKey) {
        console.error("Error: BUYER_PRIVATE_KEY is required in .env.local");
        process.exit(1);
    }

    if (!buyerPrivateKey.startsWith("0x")) {
        buyerPrivateKey = `0x${buyerPrivateKey}`;
    }

    try {
        // Create buyer wallet
        const account = privateKeyToAccount(buyerPrivateKey as `0x${string}`);
        console.log(`\nBuyer Wallet: ${account.address}`);

        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(),
        });

        // Check buyer's USDC balance before
        const balanceBefore = await publicClient.readContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        console.log(`USDC Balance (before): ${Number(balanceBefore) / 1e6} USDC`);

        if (balanceBefore === BigInt(0)) {
            console.error("\nNo USDC in wallet.");
            process.exit(1);
        }

        const signer = toClientEvmSigner(account);
        const client = new x402Client();
        registerExactEvmScheme(client, { signer });

        console.log("\nMaking paid API request with x402...");
        const x402Fetch = wrapFetchWithPayment(fetch, client);

        try {
            // Make the paid request
            const response = await x402Fetch(`${API_BASE_URL}/api/weather?city=London`);

            if (!response.ok) {
                console.error(`\nRequest failed with status: ${response.status}`);
                const errorText = await response.text();
                console.error("   Full Response Body:", errorText);

                try {
                    const errorJson = JSON.parse(errorText);
                    console.dir(errorJson, { depth: null, colors: true });
                } catch (e) {
                    // Not JSON
                }
            } else {
                const weatherData = await response.json();
                console.log("\nPayment successful! API response received:");
                console.log(JSON.stringify(weatherData, null, 2));
            }
        } catch (e) {
            console.error("\nFetch error:", e);
        }

        await new Promise(r => setTimeout(r, 2000));

        const balanceAfter = await publicClient.readContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        console.log(`\nUSDC Balance (after): ${Number(balanceAfter) / 1e6} USDC`);

        const spent = Number(balanceBefore - balanceAfter) / 1e6;
        console.log(`Debug: Before=${Number(balanceBefore) / 1e6}, After=${Number(balanceAfter) / 1e6}, Spent=${spent}`);

        if (spent > 0.0009) {
            console.log(`USDC Spent: ${spent.toFixed(6)} USDC`);
            console.log("\nSUCCESS: Payment processed on-chain!");
        } else {
            console.log("\nPayment failed to process on-chain.");
        }

    } catch (error) {
        console.error("\nError:", error);
        process.exit(1);
    }
}

// Run the test
testFullPayment();
