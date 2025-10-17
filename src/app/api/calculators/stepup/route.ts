export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	lumpsum: z.number().min(0),
	monthlySip: z.number().min(0),
	stepUpPct: z.number().min(0),
	annualRatePct: z.number().min(0),
	years: z.number().positive(),
});

export async function POST(req: NextRequest) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

	const { lumpsum, monthlySip, stepUpPct, annualRatePct, years } = parsed.data;
	const n = 12;
	const rMonthly = (annualRatePct / 100) / n;
	const totalMonths = Math.round(years * 12);

	// Lumpsum grows at monthly compounding
	const fvLumpsum = rMonthly === 0 ? lumpsum : lumpsum * Math.pow(1 + rMonthly, totalMonths);

	// Step-up SIP: each year SIP increases by stepUpPct
	let fvSip = 0;
	let investedSip = 0;
	for (let y = 1; y <= Math.ceil(years); y++) {
		const sipForYear = monthlySip * Math.pow(1 + stepUpPct / 100, y - 1);
		const monthsRemaining = Math.max(0, totalMonths - (y - 1) * 12);
		const periods = Math.min(12, monthsRemaining);
		if (periods <= 0) break;
		// FV of annuity due for that year's monthly SIP over monthsRemaining
		const fvChunk = rMonthly === 0
			? sipForYear * monthsRemaining
			: sipForYear * ((Math.pow(1 + rMonthly, monthsRemaining) - 1) / rMonthly) * (1 + rMonthly);
		fvSip += fvChunk;
		investedSip += sipForYear * Math.min(12, monthsRemaining);
	}
	const investedTotal = lumpsum + (monthlySip * 12 * years);
	const maturity = fvLumpsum + fvSip;
	const gain = maturity - investedTotal;

	return NextResponse.json({ invested: investedTotal, maturity, gain, breakdown: { fvLumpsum, fvSip } });
}
