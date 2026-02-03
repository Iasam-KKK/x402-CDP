
import { resourceServer, network, payToAddress } from "../src/lib/x402-server";

console.log("Verifying x402-server exports...");
console.log("Network:", network);
console.log("PayTo:", payToAddress);
console.log("ResourceServer defined:", !!resourceServer);

if (resourceServer) {
    console.log("ResourceServer initialization seems successful.");
} else {
    console.error("❌ ResourceServer is UNDEFINED!");
    process.exit(1);
}
