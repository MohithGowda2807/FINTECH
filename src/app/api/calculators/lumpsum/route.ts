export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	principal: z.number().positive(),
	annualRatePct: z.number().min(0),
	years: z.number().positive(),
});

export async function POST(req: NextRequest) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

	const { principal, annualRatePct, years } = parsed.data;
	const n = 12;
	const r = (annualRatePct / 100) / n;
	const totalPeriods = Math.round(n * years);
	const futureValue = r === 0 ? principal : principal * Math.pow(1 + r, totalPeriods);
	const gain = futureValue - principal;

	return NextResponse.json({ invested: principal, maturity: futureValue, gain });
}
