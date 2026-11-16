import { View } from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { useColors } from "@/lib/theme";

/** Progress ring (budget used). */
export function Ring({ value, size = 120, stroke = 12, color, track, children }: { value: number; size?: number; stroke?: number; color: string; track: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {/* An explicit arc from 12 o'clock, clockwise (no rotation transforms, which differ on web). */}
        {v >= 0.999 ? (
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" />
        ) : (
          v > 0 && <Path d={arcPath(size / 2, size / 2, r, -Math.PI / 2, -Math.PI / 2 + v * Math.PI * 2)} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        )}
      </Svg>
      {children}
    </View>
  );
}

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) =>
  `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;

/** SVG arc paths for each part, clockwise from 12 o'clock, with small gaps between them. */
function donutArcs(parts: { value: number; color: string }[], cx: number, cy: number, r: number) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const gap = parts.length > 1 ? 0.012 : 0;
  const out: { d: string; color: string }[] = [];
  let start = -Math.PI / 2;
  for (const p of parts) {
    const sweep = (p.value / total) * Math.PI * 2;
    const a0 = start + gap, a1 = start + Math.max(sweep - gap, gap * 1.01);
    start += sweep;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    out.push({ d: `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`, color: p.color });
  }
  return out;
}

/** Donut of shares (each 0–1), drawn as arcs with small gaps. */
export function Donut({ parts, size = 180, stroke = 22, children }: { parts: { value: number; color: string }[]; size?: number; stroke?: number; children?: React.ReactNode }) {
  const c = useColors();
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const arcs = donutArcs(parts, cx, cy, r);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {parts.length === 0 && <Circle cx={cx} cy={cy} r={r} stroke={c.surface2} strokeWidth={stroke} fill="none" />}
        {arcs.map((a, i) => (
          <Path key={i} d={a.d} stroke={a.color} strokeWidth={stroke} fill="none" strokeLinecap="butt" />
        ))}
      </Svg>
      {children}
    </View>
  );
}

/** Paired bars per month: income and spending. */
export function MonthBars({ data, height = 150 }: { data: { label: string; income: number; spending: number; current?: boolean }[]; height?: number }) {
  const c = useColors();
  const width = 320;
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.spending]));
  const slot = width / data.length;
  const bar = Math.min(14, slot / 3.2);
  const chartH = height - 22;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const x = i * slot + slot / 2;
        const hi = (d.income / max) * chartH, hs = (d.spending / max) * chartH;
        return (
          <G key={d.label} opacity={d.current ? 1 : 0.75}>
            <Rect x={x - bar - 2} y={chartH - hi} width={bar} height={Math.max(hi, 2)} rx={bar / 2.4} fill={c.income} />
            <Rect x={x + 2} y={chartH - hs} width={bar} height={Math.max(hs, 2)} rx={bar / 2.4} fill={c.accent} />
            <SvgText x={x} y={height - 4} fontSize={11} fontWeight={d.current ? "600" : "400"} fill={d.current ? c.ink : c.muted} textAnchor="middle">
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function Bar({ value, color, track, marker }: { value: number; color: string; track: string; marker?: number }) {
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: track, overflow: "visible", justifyContent: "center" }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
      {marker != null && marker > 0 && marker < 1 && (
        <View style={{ position: "absolute", left: `${marker * 100}%`, width: 2, height: 14, borderRadius: 1, backgroundColor: "rgba(127,127,127,0.55)" }} />
      )}
    </View>
  );
}
