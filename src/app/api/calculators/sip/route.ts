export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	amount: z.number().positive(),
	annualRatePct: z.number().min(0),
	years: z.number().positive(),
});

export async function POST(req: NextRequest) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

	const { amount, annualRatePct, years } = parsed.data;
	const n = 12;
	const r = (annualRatePct / 100) / n;
	const t = years;

	// Future value of an annuity due (SIP at period start)
	// FV = P * [((1+r)^(n*t) - 1) / r] * (1 + r)
	const totalPeriods = Math.round(n * t);
	const fvSip = r === 0 ? amount * totalPeriods : amount * ((Math.pow(1 + r, totalPeriods) - 1) / r) * (1 + r);
	const invested = amount * totalPeriods;
	const gain = fvSip - invested;

	const yearly: Array<{ year: number; invested: number; value: number }> = [];
	for (let y = 1; y <= Math.floor(t); y++) {
		const periods = n * y;
		const valueY = r === 0 ? amount * periods : amount * ((Math.pow(1 + r, periods) - 1) / r) * (1 + r);
		yearly.push({ year: y, invested: amount * periods, value: valueY });
	}

	return NextResponse.json({ invested, maturity: fvSip, gain, yearly });
}
