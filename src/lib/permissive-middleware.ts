
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { x402ResourceServer } from "@x402/core/server";

/**
 * A permissive wrapper around withX402 for Testnet debugging.
 * 
 * The default testnet facilitator (https://x402.org/facilitator) often returns 
 * "transaction_failed" even when on-chain payments succeed.
 * 
 * This middleware catches that specific error and ALLOWS the request to proceed
 * if we are on the testnet, enabling the user to see the API response.
 */
export function withPermissiveX402(
    handler: (req: NextRequest) => Promise<NextResponse>,
    config: any,
    server: x402ResourceServer
) {
    console.log("CoreMiddleware: Initializing with server:", !!server, typeof server);
    if (server) console.log("CoreMiddleware: Server schemes:", server.registeredServerSchemes);

    let protectedHandler;
    try {
        protectedHandler = withX402(handler, config, server);
    } catch (e) {
        console.error("CoreMiddleware: withX402 CRASHED:", e);
        throw e;
    }

    return async (req: NextRequest) => {
        // Run the standard protection
        const response = await protectedHandler(req);

        // If successful or not a payment error, return as is
        if (response.status !== 402) {
            return response;
        }

        // Check if it's the specific testnet false negative
        try {
            const body = await response.clone().json();
            const isTransactionFailed = body.error === "Settlement failed" &&
                body.details === "transaction_failed";

            const isTestnet = process.env.X402_NETWORK !== "base";

            if (isTransactionFailed && isTestnet) {
                console.warn("⚠️ Permissive Middleware: Bypassing facilitator false negative on Testnet.");
                // Execute the original handler directly, bypassing the block
                return handler(req);
            }
        } catch (e) {
            // If we can't parse JSON, ignore and return original error
        }

        return response;
    };
}
