export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	lumpsum: z.number().min(0),
	monthlySip: z.number().min(0),
	annualRatePct: z.number().min(0),
	years: z.number().positive(),
});

export async function POST(req: NextRequest) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

	const { lumpsum, monthlySip, annualRatePct, years } = parsed.data;
	const n = 12;
	const r = (annualRatePct / 100) / n;
	const totalPeriods = Math.round(n * years);

	const fvLumpsum = r === 0 ? lumpsum : lumpsum * Math.pow(1 + r, totalPeriods);
	const fvSip = r === 0 ? monthlySip * totalPeriods : monthlySip * ((Math.pow(1 + r, totalPeriods) - 1) / r) * (1 + r);
	const invested = lumpsum + monthlySip * 12 * years;
	const maturity = fvLumpsum + fvSip;
	const gain = maturity - invested;

	return NextResponse.json({ invested, maturity, gain, breakdown: { fvLumpsum, fvSip } });
}
