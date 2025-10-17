export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { userData, question } = await req.json();
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

		const sys = "You are a certified financial advisor for India. Be clear, actionable, and consider taxes, risk and goals.";
		const prompt = `Income: ${JSON.stringify(userData?.income)}\nExpenses: ${JSON.stringify(userData?.expenses)}\nInvestments: ${JSON.stringify(userData?.investments)}\nTaxation: ${JSON.stringify(userData?.taxation)}\nDebts: ${JSON.stringify(userData?.debts)}\nGoals: ${JSON.stringify(userData?.goals)}\nQuestion: ${question}`;

		const resp = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: sys },
					{ role: "user", content: prompt },
				],
				temperature: 0.6,
			}),
		});

		if (!resp.ok) {
			const t = await resp.text();
			return NextResponse.json({ error: "OpenAI error", detail: t }, { status: 500 });
		}
		const data = await resp.json();
		const content = data?.choices?.[0]?.message?.content ?? "";
		return NextResponse.json({ content });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
