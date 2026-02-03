"use client";

import { useState } from "react";

const apiServices = [
    {
        id: "weather",
        name: "Weather API",
        description: "Get real-time weather data for any city worldwide including temperature, humidity, wind speed, and conditions.",
        price: "$0.001",
        network: "Base Sepolia",
        endpoint: "/api/weather",
        params: "?city={city}",
        example: "?city=London",
        icon: "🌤️",
        color: "from-blue-500 to-cyan-400",
    },
    {
        id: "exchange",
        name: "Exchange Rate API",
        description: "Get current exchange rates between 150+ currencies with real-time conversion calculations.",
        price: "$0.001",
        network: "Base Sepolia",
        endpoint: "/api/exchange",
        params: "?from={from}&to={to}&amount={amount}",
        example: "?from=USD&to=EUR&amount=100",
        icon: "💱",
        color: "from-green-500 to-emerald-400",
    },
];

export default function Marketplace() {
    const [selectedApi, setSelectedApi] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const testApiEndpoint = async (apiId: string, endpoint: string, example: string) => {
        setSelectedApi(apiId);
        setIsLoading(true);
        setTestResult(null);

        try {
            const response = await fetch(`${endpoint}${example}`);
            const data = await response.json();

            if (response.status === 402) {
                setTestResult(JSON.stringify({
                    status: 402,
                    message: "Payment Required",
                    info: "This API requires x402 payment. Send a payment via PAYMENT-SIGNATURE header.",
                    paymentDetails: data,
                }, null, 2));
            } else {
                setTestResult(JSON.stringify(data, null, 2));
            }
        } catch (error) {
            setTestResult(JSON.stringify({ error: "Failed to fetch API" }, null, 2));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <header className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Powered by Coinbase x402 Protocol
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
                            x402 API Marketplace
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Pay-per-use APIs for AI Agents and developers. Instant USDC micropayments on Base with sub-second confirmation.
                        </p>
                    </header>

                    {/* API Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                        {apiServices.map((api) => (
                            <div
                                key={api.id}
                                className="glass-card rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`text-4xl p-3 rounded-2xl bg-gradient-to-br ${api.color} bg-opacity-20`}>
                                            {api.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{api.name}</h2>
                                            <span className="text-xs text-gray-500">{api.network}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-xl text-lg font-bold border border-green-500/20">
                                            {api.price}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">per request</span>
                                    </div>
                                </div>

                                <p className="text-gray-400 mb-6 leading-relaxed">{api.description}</p>

                                <div className="bg-gray-900/80 rounded-xl p-4 mb-6 font-mono text-sm overflow-x-auto">
                                    <span className="text-purple-400">GET</span>
                                    <span className="text-gray-300"> {api.endpoint}</span>
                                    <span className="text-blue-400">{api.params}</span>
                                </div>

                                <button
                                    onClick={() => testApiEndpoint(api.id, api.endpoint, api.example)}
                                    disabled={isLoading && selectedApi === api.id}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${isLoading && selectedApi === api.id
                                            ? "bg-gray-700 cursor-not-allowed"
                                            : `bg-gradient-to-r ${api.color} hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25`
                                        }`}
                                >
                                    {isLoading && selectedApi === api.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Testing...
                                        </span>
                                    ) : (
                                        "Test API (402 Response)"
                                    )}
                                </button>

                                {/* Test Result */}
                                {selectedApi === api.id && testResult && (
                                    <div className="mt-4 bg-gray-900/80 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-60 overflow-y-auto">
                                        <pre className="text-green-400 whitespace-pre-wrap">{testResult}</pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* How It Works */}
                    <section className="max-w-5xl mx-auto mb-20">
                        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { step: "1", title: "Request API", desc: "Call any endpoint - receive 402 Payment Required with payment details", icon: "📡" },
                                { step: "2", title: "Sign Payment", desc: "Sign USDC payment on Base using your wallet (human or agent)", icon: "✍️" },
                                { step: "3", title: "Verify & Settle", desc: "CDP Facilitator verifies and settles payment on-chain instantly", icon: "✅" },
                                { step: "4", title: "Get Response", desc: "Receive your API response with verified payment receipt", icon: "📦" },
                            ].map((item) => (
                                <div key={item.step} className="glass-card rounded-2xl p-6 text-center relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                        {item.step}
                                    </div>
                                    <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                                    <h3 className="font-bold mb-2 text-lg">{item.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Bazaar Discovery */}
                    <section className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-10">
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-3xl font-bold mb-4">CDP Bazaar Discovery</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            All APIs are registered with the CDP Bazaar discovery layer, making them automatically discoverable by AI agents worldwide. No API keys required - just pay and access.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                            Discoverable by AI Agents
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8">
                <div className="container mx-auto px-4 text-center text-gray-500">
                    <p>Built with x402 Protocol • Base Sepolia Testnet • USDC Payments</p>
                    <p className="text-sm mt-2">© 2025 x402 API Marketplace</p>
                </div>
            </footer>
        </main>
    );
}
