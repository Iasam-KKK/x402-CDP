// @ts-ignore
import fetch from "node-fetch";

const CATALOG_EP = "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=1000";
// The user's deployed URL (from their recent edit)
const MY_APP_URL = "https://x402-cdp-production.up.railway.app";

async function listCatalog() {
    console.log(`Fetching catalog from: ${CATALOG_EP}`);

    try {
        const response = await fetch(CATALOG_EP);

        if (!response.ok) {
            throw new Error(`Failed to fetch catalog: ${response.status} ${response.statusText}`);
        }

        const rawBody = await response.json();
        console.log("Response type:", typeof rawBody);
        console.log("Is Array?", Array.isArray(rawBody));
        console.log("Object keys:", Object.keys(rawBody));
        // console.log("First 500 chars:", JSON.stringify(rawBody).substring(0, 500));

        let resources: any[] = [];
        if (Array.isArray(rawBody)) {
            resources = rawBody;
        } else if (rawBody && typeof rawBody === 'object' && 'items' in rawBody) {
            // We found the resources array
            resources = (rawBody as any).items;
        }

        console.log(`\nFound ${resources.length} resources in the catalog.`);

        // Filter for our resources using the correct property 'resource' which holds the URL
        const myResources = resources.filter(r =>
            (r.resource && r.resource.includes(MY_APP_URL)) ||
            (r.metadata?.name && (r.metadata.name.includes("Weather API") || r.metadata.name.includes("Exchange Rate API")))
        );

        if (myResources.length > 0) {
            console.log("\n✅ YOUR APIS ARE LISTED!");
            console.log("=".repeat(50));
            myResources.forEach(r => {
                console.log(`\nResource URL: ${r.resource}`);
                console.log(`Network: ${r.accepts?.[0]?.network || "Unknown"}`);
                console.log(`Payment: ${r.accepts?.[0]?.amount} ${r.accepts?.[0]?.extra?.name || "tokens"}`);
            });
        } else {
            console.log("\n⚠️ Your specific APIs were not found by URL match.");
            console.log(`Checked against Deployment URL: ${MY_APP_URL}`);

            // Log some examples to show it's working
            console.log("\nFirst 5 resources found in catalog (for verification):");
            resources.slice(0, 5).forEach(r => {
                console.log(`- ${r.resource} (${r.accepts?.[0]?.network})`);
            });
        }

    } catch (error) {
        console.error("Error fetching catalog:", error);
    }
}

listCatalog();
