"use client";

import { useState } from "react";
import { Slider } from "@radix-ui/react-slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function formatINR(v: number) {
	return v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

export default function CalculatorsPage() {
	const [sipAmount, setSipAmount] = useState(5000);
	const [sipRate, setSipRate] = useState(12);
	const [sipYears, setSipYears] = useState(10);
	const [sipData, setSipData] = useState<any>(null);

	const [lsPrincipal, setLsPrincipal] = useState(100000);
	const [lsRate, setLsRate] = useState(12);
	const [lsYears, setLsYears] = useState(10);
	const [lsData, setLsData] = useState<any>(null);

	async function calcSIP() {
		const res = await fetch("/api/calculators/sip", { method: "POST", body: JSON.stringify({ amount: sipAmount, annualRatePct: sipRate, years: sipYears }) });
		setSipData(await res.json());
	}
	async function calcLumpsum() {
		const res = await fetch("/api/calculators/lumpsum", { method: "POST", body: JSON.stringify({ principal: lsPrincipal, annualRatePct: lsRate, years: lsYears }) });
		setLsData(await res.json());
	}

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-10">
			<h1 className="text-2xl font-semibold">Calculators</h1>

			<section className="space-y-4 border rounded-lg p-4">
				<h2 className="text-xl font-medium">SIP Calculator</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="text-sm">Monthly Investment (₹{sipAmount})</label>
						<Slider value={[sipAmount]} min={500} max={200000} step={500} onValueChange={(v) => setSipAmount(v[0])} />
					</div>
					<div>
						<label className="text-sm">Expected Return (% {sipRate})</label>
						<Slider value={[sipRate]} min={0} max={25} step={0.5} onValueChange={(v) => setSipRate(v[0])} />
					</div>
					<div>
						<label className="text-sm">Years ({sipYears})</label>
						<Slider value={[sipYears]} min={1} max={40} step={1} onValueChange={(v) => setSipYears(v[0])} />
					</div>
				</div>
				<button className="mt-4 bg-black text-white px-4 py-2 rounded" onClick={calcSIP}>Calculate</button>
				{sipData && (
					<div className="mt-4 space-y-2">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="p-3 border rounded">Invested: {formatINR(sipData.invested)}</div>
							<div className="p-3 border rounded">Maturity: {formatINR(sipData.maturity)}</div>
							<div className="p-3 border rounded">Gain: {formatINR(sipData.gain)}</div>
						</div>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={sipData.yearly?.map((d: any) => ({ year: d.year, value: Math.round(d.value) }))}>
									<CartesianGrid stroke="#eee" strokeDasharray="5 5" />
									<XAxis dataKey="year" />
									<YAxis tickFormatter={(v) => (v / 100000).toFixed(1) + "L"} />
									<Tooltip formatter={(v: any) => formatINR(Number(v))} />
									<Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>
				)}
			</section>

			<section className="space-y-4 border rounded-lg p-4">
				<h2 className="text-xl font-medium">Lumpsum Calculator</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="text-sm">Initial Investment (₹{lsPrincipal})</label>
						<Slider value={[lsPrincipal]} min={10000} max={10000000} step={10000} onValueChange={(v) => setLsPrincipal(v[0])} />
					</div>
					<div>
						<label className="text-sm">Expected Return (% {lsRate})</label>
						<Slider value={[lsRate]} min={0} max={25} step={0.5} onValueChange={(v) => setLsRate(v[0])} />
					</div>
					<div>
						<label className="text-sm">Years ({lsYears})</label>
						<Slider value={[lsYears]} min={1} max={40} step={1} onValueChange={(v) => setLsYears(v[0])} />
					</div>
				</div>
				<button className="mt-4 bg-black text-white px-4 py-2 rounded" onClick={calcLumpsum}>Calculate</button>
				{lsData && (
					<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="p-3 border rounded">Invested: {formatINR(lsData.invested)}</div>
						<div className="p-3 border rounded">Maturity: {formatINR(lsData.maturity)}</div>
						<div className="p-3 border rounded">Gain: {formatINR(lsData.gain)}</div>
					</div>
				)}
			</section>
		</div>
	);
}
