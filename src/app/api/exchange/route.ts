import { NextRequest, NextResponse } from "next/server";
import { withPermissiveX402 } from "@/lib/permissive-middleware";
import { resourceServer, network, payToAddress } from "@/lib/x402-server";

// The actual exchange rate API handler
async function exchangeHandler(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const from = (searchParams.get("from") || "USD").toUpperCase();
    const to = (searchParams.get("to") || "EUR").toUpperCase();
    const amountStr = searchParams.get("amount") || "1";
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
            { error: "Invalid amount. Must be a positive number." },
            { status: 400 }
        );
    }

    try {
        const apiKey = process.env.EXCHANGERATE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Exchange Rate API not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (errorData["error-type"] === "unsupported-code") {
                return NextResponse.json(
                    { error: "Unsupported currency code", from, to },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: "Failed to fetch exchange rate" },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.result !== "success") {
            return NextResponse.json(
                { error: "Exchange rate lookup failed", details: data["error-type"] },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                from: {
                    currency: from,
                    amount: amount,
                },
                to: {
                    currency: to,
                    amount: data.conversion_result,
                },
                rate: data.conversion_rate,
                lastUpdated: data.time_last_update_utc,
                nextUpdate: data.time_next_update_utc,
            },
            meta: {
                api: "x402-marketplace/exchange",
                version: "1.0.0",
                pricePerRequest: "$0.001 USDC",
                network: "base-sepolia",
            },
        });
    } catch (error) {
        console.error("Exchange Rate API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Export the route handler wrapped with x402 payment protection (permissive for testnet)
export const GET = withPermissiveX402(
    exchangeHandler as any,
    {
        accepts: {
            scheme: "exact",
            price: "$0.001",
            network: network,
            payTo: payToAddress,
        },
        description: "Get current exchange rates between 150+ currencies",
        mimeType: "application/json",
    },
    resourceServer
);
