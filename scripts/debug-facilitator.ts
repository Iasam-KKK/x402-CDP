
import * as dotenv from "dotenv";
import * as path from "path";
import { facilitator } from "@coinbase/x402";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function debugFacilitator() {
    console.log("Debugging Facilitator Config...");

    try {
        console.log("Facilitator Config:", JSON.stringify(facilitator, null, 2));

        const apiKeyId = process.env.CDP_API_KEY_ID;
        const apiKeySecret = process.env.CDP_API_KEY_SECRET;

        console.log(`CDP_API_KEY_ID present: ${!!apiKeyId}`);
        console.log(`CDP_API_KEY_SECRET present: ${!!apiKeySecret}`);

        if (facilitator.createAuthHeaders) {
            console.log("createAuthHeaders function exists.");
            const headers = await facilitator.createAuthHeaders({
                method: "GET",
                host: "api.cdp.coinbase.com",
                path: "/platform/v2/x402"
            });
            console.log("Headers generated.");

            // Try actual fetch
            console.log("Attempting fetch to:", facilitator.url);
            try {
                const res = await fetch(facilitator.url, {
                    headers: {
                        ...headers,
                        "Content-Type": "application/json"
                    }
                });
                console.log("Fetch Status:", res.status);
                const text = await res.text();
                console.log("Response:", text.substring(0, 500)); // Log first 500 chars
            } catch (fetchErr) {
                console.error("Fetch FAILED:", fetchErr);
            }
        }

    } catch (e) {
        console.error("Error inspecting facilitator:", e);
    }
}

debugFacilitator();
