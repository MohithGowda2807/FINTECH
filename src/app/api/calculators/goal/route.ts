export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	goalAmount: z.number().positive(),
	currentSavings: z.number().min(0).default(0),
	years: z.number().positive(),
	annualReturnPct: z.number().min(0),
	inflationPct: z.number().min(0),
});

export async function POST(req: NextRequest) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

	const { goalAmount, currentSavings, years, annualReturnPct, inflationPct } = parsed.data;
	const r = annualReturnPct / 100;
	const i = inflationPct / 100;

	// Adjusted goal in future terms
	const adjustedGoal = goalAmount * Math.pow(1 + i, years);
	const pvOfCurrent = currentSavings * Math.pow(1 + r, years);
	const gap = Math.max(0, adjustedGoal - pvOfCurrent);

	// Required SIP (annuity due monthly)
	const n = 12;
	const rm = r / n;
	const periods = Math.round(years * 12);
	const denom = rm === 0 ? periods + 1 : ((Math.pow(1 + rm, periods) - 1) / rm) * (1 + rm);
	const requiredSip = denom === 0 ? 0 : gap / denom;

	// Required lumpsum today
	const requiredLumpsum = r === 0 ? gap : gap / Math.pow(1 + r, years);

	return NextResponse.json({
		adjustedGoal,
		gapNeeded: gap,
		requiredSipMonthly: requiredSip,
		requiredLumpsum,
	});
}
