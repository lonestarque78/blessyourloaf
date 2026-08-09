'use client'

import { useMemo, useState } from 'react'

interface Feeding {
  id: string
  fed_at: string
  rise_percent: number | null
}

interface Props {
  feedings: Feeding[]
}

const WIDTH = 640
const HEIGHT = 220
const PAD_LEFT = 36
const PAD_RIGHT = 16
const PAD_TOP = 16
const PAD_BOTTOM = 28

export default function GrowthChart({ feedings }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const points = useMemo(() => {
    return feedings
      .filter((f): f is Feeding & { rise_percent: number } => f.rise_percent !== null)
      .sort((a, b) => new Date(a.fed_at).getTime() - new Date(b.fed_at).getTime())
  }, [feedings])

  if (points.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#f0e4db] text-center">
        <div className="text-3xl mb-2">📈</div>
        <p className="font-lora italic text-sm text-[#9a7060]">
          Log a couple more feedings with a rise % and we&apos;ll chart her growth trend.
        </p>
      </div>
    )
  }

  const values = points.map(p => p.rise_percent)
  const latest = values[values.length - 1]
  const previous = values[values.length - 2]
  const average = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
  const trend = latest - previous

  const yMax = Math.max(...values, 100) * 1.15
  const yMin = 0
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  const xFor = (i: number) => PAD_LEFT + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth)
  const yFor = (v: number) => PAD_TOP + plotHeight - ((v - yMin) / (yMax - yMin)) * plotHeight

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.rise_percent)}`).join(' ')
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${yFor(yMin)} L ${xFor(0)} ${yFor(yMin)} Z`

  // Gridlines at a handful of round rise-percent values, not one per data point.
  const gridSteps = 4
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => Math.round((yMax / gridSteps) * i))

  // Label every point if there are few, otherwise just the first/middle/last to avoid collisions.
  const labelIndexes = points.length <= 5
    ? points.map((_, i) => i)
    : [0, Math.floor((points.length - 1) / 2), points.length - 1]

  const active = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0e4db]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-playfair text-lg font-bold text-[#3d2b1f]">Growth Trend</h3>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-lora text-[10px] uppercase tracking-widest text-[#b8896e]">Latest</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{latest}%</div>
          </div>
          <div className="text-right">
            <div className="font-lora text-[10px] uppercase tracking-widest text-[#b8896e]">Average</div>
            <div className="font-playfair text-lg font-bold text-[#3d2b1f]">{average}%</div>
          </div>
          <div className="text-right">
            <div className="font-lora text-[10px] uppercase tracking-widest text-[#b8896e]">Trend</div>
            <div className={`font-playfair text-lg font-bold ${trend > 0 ? 'text-green-700' : trend < 0 ? 'text-[#b5838d]' : 'text-[#3d2b1f]'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
            </div>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Gridlines — recessive, with value labels */}
        {gridValues.map(v => (
          <g key={v}>
            <line
              x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yFor(v)} y2={yFor(v)}
              stroke="#f0e4db" strokeWidth={1}
            />
            <text x={PAD_LEFT - 8} y={yFor(v)} textAnchor="end" dominantBaseline="middle"
              className="fill-[#c8a99a]" fontSize={10} fontFamily="var(--font-lora), sans-serif">
              {v}%
            </text>
          </g>
        ))}

        {/* Area fill under the line */}
        <path d={areaPath} fill="url(#growthGradient)" opacity={0.15} />
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9956c" />
            <stop offset="100%" stopColor="#c9956c" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* The line itself */}
        <path d={linePath} fill="none" stroke="#b07d62" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points + hover hit targets */}
        {points.map((p, i) => (
          <g key={p.id}>
            <circle cx={xFor(i)} cy={yFor(p.rise_percent)} r={4} fill="#b07d62" />
            {/* Larger invisible hit target, per the interaction spec */}
            <circle
              cx={xFor(i)} cy={yFor(p.rise_percent)} r={12} fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              style={{ cursor: 'pointer' }}
            />
            {labelIndexes.includes(i) && (
              <text x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-[#9a7060]" fontSize={10} fontFamily="var(--font-lora), sans-serif">
                {new Date(p.fed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            )}
          </g>
        ))}

        {/* Crosshair for the hovered point */}
        {active && hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)} x2={xFor(hoverIndex)} y1={PAD_TOP} y2={PAD_TOP + plotHeight}
            stroke="#c9956c" strokeWidth={1} strokeDasharray="3,3"
          />
        )}
      </svg>

      {/* Tooltip, rendered as normal DOM below the chart so it never gets clipped by the SVG viewport */}
      <div className="h-6 mt-1 text-center">
        {active && (
          <span className="font-lora text-xs text-[#7a4f3a] bg-[#f9ede5] px-3 py-1 rounded-full">
            {new Date(active.fed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — {active.rise_percent}% rise
          </span>
        )}
      </div>
    </div>
  )
}
