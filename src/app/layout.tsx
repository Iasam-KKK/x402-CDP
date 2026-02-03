import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "x402 API Marketplace | Pay-per-use APIs for AI Agents",
    description:
        "A payment-gated API marketplace powered by Coinbase x402 protocol. Access Weather, Exchange Rates, and more APIs with instant USDC micropayments on Base.",
    keywords: ["x402", "API", "marketplace", "Coinbase", "USDC", "Base", "AI agents", "micropayments"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
