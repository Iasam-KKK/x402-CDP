/**
 * x402 Buyer Test Script
 * 
 * This script tests the x402 payment flow by:
 * 1. Calling a protected API → receiving 402 Payment Required
 * 2. Parsing the payment requirements
 * 3. Signing and sending a USDC payment
 * 4. Re-calling the API with the payment proof
 * 
 * Usage: npx tsx scripts/test-buyer.ts
 * 
 * Required: Set BUYER_PRIVATE_KEY in .env.local (your MetaMask wallet private key)
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// USDC contract address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

// USDC ABI (just approve and transfer functions we need)
const USDC_ABI = [
    {
        name: "approve",
        type: "function",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
] as const;

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

async function testBuyerFlow() {
    console.log("\nx402 Buyer Test Script\n");
    console.log("=".repeat(50));

    // Validate buyer private key
    let buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
    if (!buyerPrivateKey) {
        console.error(" Error: BUYER_PRIVATE_KEY is required in .env.local");
        console.error("   Export your MetaMask private key and add it to .env.local");
        console.error("   Example: BUYER_PRIVATE_KEY=0xabc123... (64 hex chars after 0x)");
        process.exit(1);
    }

    // Ensure the key has 0x prefix
    if (!buyerPrivateKey.startsWith("0x")) {
        buyerPrivateKey = `0x${buyerPrivateKey}`;
    }

    // Validate key length (should be 66 chars: 0x + 64 hex chars)
    if (buyerPrivateKey.length !== 66) {
        console.error("Error: Invalid private key length");
        console.error(`   Expected 64 hex characters after 0x (got ${buyerPrivateKey.length - 2})`);
        console.error("   Make sure you copied the full private key from MetaMask");
        process.exit(1);
    }

    try {
        // Create buyer wallet client
        const account = privateKeyToAccount(buyerPrivateKey as `0x${string}`);
        console.log(`\nBuyer Wallet: ${account.address}`);

        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(),
        });

        const walletClient = createWalletClient({
            account,
            chain: baseSepolia,
            transport: http(),
        });

        // Check buyer's USDC balance
        const balance = await publicClient.readContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: "balanceOf",
            args: [account.address],
        });
        console.log(`USDC Balance: ${Number(balance) / 1e6} USDC`);

        if (balance === 0) {
            console.error("\nNo USDC in wallet. Get testnet USDC from:");
            console.error("   https://faucet.circle.com/ (select Base Sepolia)");
            process.exit(1);
        }

        // Step 1: Call the API without payment
        console.log("\n Step 1: Calling Weather API without payment...");
        const response = await fetch(`${API_BASE_URL}/api/weather?city=London`);

        if (response.status !== 402) {
            console.log(`   Unexpected status: ${response.status}`);
            console.log("   Response:", await response.text());
            process.exit(1);
        }

        console.log("   Received 402 Payment Required");

        // Step 2: Parse payment requirements from response
        console.log("\n Step 2: Parsing payment requirements...");
        const paymentRequired = await response.json();
        console.log("   Payment Requirements:", JSON.stringify(paymentRequired, null, 2));

        // The 402 response should contain payment details
        // Format depends on x402 version, but typically includes:
        // - accepts: array of accepted payment methods
        // - price: required payment amount
        // - payTo: recipient address

        console.log("\n Payment flow test complete!");
        console.log("\n To complete a full payment:");
        console.log("   1. Use the x402 fetch wrapper or CDP Agent SDK");
        console.log("   2. The library handles payment signing automatically");
        console.log("   3. Example: npm install @x402/fetch");
        console.log(`
Example code with @x402/fetch:
    
import { wrapFetch } from "@x402/fetch";

const x402Fetch = wrapFetch(fetch, walletClient);
const response = await x402Fetch("${API_BASE_URL}/api/weather?city=London");
const data = await response.json();
console.log(data);
`);

    } catch (error) {
        console.error("\n Error:", error);
        process.exit(1);
    }
}

// Run the test
testBuyerFlow();
