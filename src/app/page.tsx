'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Check,
  Cpu,
  ExternalLink,
  Layers,
  Mail,
  Menu,
  Terminal,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  DESIGN SYSTEM                                                             */
/*  A warm "instrument bench" world: bone paper, oxide red, teal, amber CRT.   */
/* -------------------------------------------------------------------------- */

const GLOBAL_CSS = `
:root {
  --paper: #F1EBDD;
  --paper-2: #E7DCC6;
  --ink: #151B1C;
  --signal: #D94F2B;
  --teal: #1C6A6E;
  --amber: #F0AF55;
  --cyan: #8FDDE3;
  --line: rgba(21, 27, 28, 0.16);
  --font-body: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-display: "Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
html { scroll-behavior: smooth; scroll-padding-top: 86px; }
body { background: var(--paper); color: var(--ink); -webkit-font-smoothing: antialiased; }
::selection { background: var(--signal); color: var(--paper); }
.paper-grid {
  background-image:
    linear-gradient(to right, rgba(21,27,28,0.055) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(21,27,28,0.055) 1px, transparent 1px);
  background-size: 44px 44px;
}
.paper-fade {
  background: linear-gradient(180deg, rgba(241,235,221,0) 0%, rgba(241,235,221,0.82) 68%, var(--paper) 100%);
}
.marquee-track { animation: marquee 30s linear infinite; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.chip-pulse { animation: chipPulse 2.6s ease-in-out infinite; }
@keyframes chipPulse {
  0%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }
  50% { transform: rotate(90deg) scale(0.66); opacity: 0.7; }
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .marquee-track, .chip-pulse { animation: none; }
}
`;

/* -------------------------------------------------------------------------- */
/*  CONTENT                                                                   */
/* -------------------------------------------------------------------------- */

const PROFILE = {
  name: 'Ayush S',
  role: 'Hardware Tinkerer & Low-Level Systems Builder',
  email: 'ayuusses@gmail.com',
  github: 'https://github.com/ayuusse',
  linkedin: 'http://linkedin.com/in/ayush-s-35b49a284',
  location: 'BITS Pilani · Hyderabad Campus',
};

const NAV_LINKS = [
  { index: '00', label: 'Index', href: '#top' },
  { index: '01', label: 'The Operator', href: '#about' },
  { index: '02', label: 'Builds', href: '#work' },
  { index: '03', label: 'The Bench', href: '#stack' },
  { index: '04', label: 'Contact', href: '#contact' },
];

type Project = {
  index: string;
  title: string;
  kicker: string;
  description: string;
  tags: string[];
  metric: string;
  metricUnit: string;
  visual: 'board' | 'maze' | 'scope';
  icon: LucideIcon;
  bg: string;
  fg: string;
  accent: string;
  border: string;
};

const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Java Chess Engine',
    kicker: 'SOFTWARE / BITWISE',
    description:
      'A high-performance 64-bit bitboard engine built in pure Java. Custom bitwise move generation and perft validation clocking in at roughly 25 million nodes per second.',
    tags: ['JAVA', 'BITBOARDS', 'PERFT', 'MOVE GEN'],
    metric: '25M',
    metricUnit: 'NODES / SECOND',
    visual: 'board',
    icon: Layers,
    bg: '#151B1C',
    fg: '#F1EBDD',
    accent: '#F0AF55',
    border: '#2C4043',
  },
  {
    index: '02',
    title: 'Verilog Maze Game',
    kicker: 'HARDWARE / RTL',
    description:
      'A hardware-level grid navigation game written in synthesizable Verilog. Finite state machines handle collision detection, verified through EDA Playground testbenches.',
    tags: ['VERILOG', 'FSM', 'EDA PLAYGROUND'],
    metric: 'RTL',
    metricUnit: 'SYNTHESIZABLE LOGIC',
    visual: 'maze',
    icon: Cpu,
    bg: '#1C6A6E',
    fg: '#F1EBDD',
    accent: '#8FDDE3',
    border: '#12565A',
  },
  {
    index: '03',
    title: 'Benchtop Digital Storage Oscilloscope',
    kicker: 'MIXED-SIGNAL / EMBEDDED',
    description:
      'An embedded mixed-signal tool built in C/C++ to capture, sample, and reconstruct real-time analog waveforms on a bench display, complete with custom trigger routines.',
    tags: ['C', 'C++', 'ADC', 'TRIGGER ROUTINES'],
    metric: 'C/C++',
    metricUnit: 'CAPTURE → RECONSTRUCT',
    visual: 'scope',
    icon: Activity,
    bg: '#E7DCC6',
    fg: '#151B1C',
    accent: '#D94F2B',
    border: 'rgba(21,27,28,0.2)',
  },
];

const STACK = [
  { name: 'Java', type: 'ENGINE / JVM', level: 92 },
  { name: 'C', type: 'EMBEDDED / BARE-METAL', level: 90 },
  { name: 'C++', type: 'SYSTEMS / SIGNAL', level: 84 },
  { name: 'Verilog', type: 'RTL / FPGA', level: 78 },
  { name: 'Linux · Fedora', type: 'DAILY DRIVER / SHELL', level: 95 },
  { name: 'PlatformIO', type: 'FIRMWARE / TOOLCHAIN', level: 82 },
  { name: 'Next.js', type: 'INTERFACE / WEB', level: 76 },
  { name: 'Fusion 360', type: 'CAD / ENCLOSURES', level: 70 },
];

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/* -------------------------------------------------------------------------- */
/*  MATH HELPERS (deterministic — safe for SSR)                               */
/* -------------------------------------------------------------------------- */

function makeWave(phase: number, amplitude: number) {
  const points: string[] = [];
  for (let i = 0; i <= 480; i += 1) {
    const x = i * 5;
    const y =
      60 -
      Math.sin((x / 600) * Math.PI * 2 + phase) * amplitude -
      Math.sin((x / 150) * Math.PI * 2 + phase * 1.7) * amplitude * 0.2 +
      Math.sin((x / 75) * Math.PI * 2) * 3;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

const WAVE_PRIMARY = makeWave(0, 26);
const WAVE_SECONDARY = makeWave(1.15, 15);

/* -------------------------------------------------------------------------- */
/*  ATOMS                                                                     */
/* -------------------------------------------------------------------------- */

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function SignalTrace({ className, color = 'var(--signal)' }: { className?: string; color?: string }) {
  const d = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= 400; i += 1) {
      const x = i * 3;
      const burst = Math.exp(-Math.pow((x - 600) / 95, 2));
      const y =
        60 -
        Math.sin(i * 0.11) * 10 -
        Math.sin(i * 0.037) * 9 -
        burst * Math.sin(i * 0.62) * 28;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, []);

  return (
    <svg
      className={className}
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 170, damping: 20, mass: 0.45 });
  const sy = useSpring(my, { stiffness: 170, damping: 20, mass: 0.45 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-4.5, 4.5]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [4.5, -4.5]);

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left) / rect.width - 0.5);
        my.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function MagneticLink({
  href,
  children,
  className,
  filled = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  filled?: boolean;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 240, damping: 15 });
  const y = useSpring(my, { stiffness: 240, damping: 15 });

  return (
    <motion.a
      href={href}
      className={cn(
        'group inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em]',
        className,
      )}
      style={{
        x,
        y,
        background: filled ? 'var(--signal)' : 'transparent',
        color: filled ? '#FFF6E8' : 'var(--ink)',
        border: filled ? '1px solid var(--signal)' : '1px solid var(--ink)',
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left - rect.width / 2) * 0.18);
        my.set((event.clientY - rect.top - rect.height / 2) * 0.18);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
    >
      {children}
    </motion.a>
  );
}

function CopyEmailButton({ dark = false }: { dark?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center justify-center rounded-full px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors"
      style={{
        border: `1px solid ${dark ? 'rgba(241,235,221,0.35)' : 'var(--ink)'}`,
        color: dark ? 'var(--paper)' : 'var(--ink)',
        background: copied
          ? dark
            ? 'rgba(240,175,85,0.16)'
            : 'rgba(217,79,43,0.09)'
          : 'transparent',
      }}
      aria-label={`Copy email address ${PROFILE.email}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'done' : 'idle'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center gap-2"
        >
          {copied ? <Check size={14} /> : <Mail size={14} />}
          {copied ? 'EMAIL COPIED' : 'COPY EMAIL'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function SectionHeader({
  index,
  label,
  title,
  hint,
}: {
  index: string;
  label: string;
  title: ReactNode;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
          <span style={{ color: 'var(--signal)' }}>{index}</span>
          <span className="h-px w-10" style={{ background: 'var(--ink)', opacity: 0.3 }} />
          <span>{label}</span>
        </div>
        <h2
          className="uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '-0.055em',
            lineHeight: 0.87,
            fontSize: 'clamp(2.6rem, 6.4vw, 6rem)',
          }}
        >
          {title}
        </h2>
      </div>
      {hint ? (
        <p className="max-w-[290px] font-mono text-[10px] leading-[1.8] tracking-[0.08em] opacity-55">
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MICRO-EXPERIENCE — LIVE 64-BIT BITBOARD PROBE                             */
/* -------------------------------------------------------------------------- */

function PinRail() {
  return (
    <div className="flex w-[8px] shrink-0 flex-col justify-around py-10" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="h-[11px] w-[8px] rounded-[2px]"
          style={{ background: 'linear-gradient(90deg, #C9A25B, #8C6C33)' }}
        />
      ))}
    </div>
  );
}

function BitboardProbe() {
  const [bits, setBits] = useState<boolean[]>(() => {
      // Define your starting hex value here
      const initialHex = BigInt("0x3C42A981A599423C");
      
      // Extract each bit using BigInt bitwise operations
      return Array.from({ length: 64 }, (_, i) =>
         ((initialHex >> BigInt(i)) & 1n) === 1n
      );
   });
  const [cursor, setCursor] = useState(-1);
  const [running, setRunning] = useState(false);
  const [nodes, setNodes] = useState(0);
  const painting = useRef(false);
  const paintValue = useRef(false);
  const timer = useRef<number | null>(null);

  const setBit = useCallback((index: number, value: boolean) => {
    setBits((previous) => {
      if (previous[index] === value) return previous;
      const next = previous.slice();
      next[index] = value;
      return next;
    });
  }, []);

  const hex = useMemo(
    () =>
      Array.from({ length: 16 }, (_, nibble) => {
        const value = bits
          .slice(60 - nibble * 4, 64 - nibble * 4)
          .reverse()
          .reduce((acc, on) => acc * 2 + (on ? 1 : 0), 0);
        return value.toString(16).toUpperCase();
      }).join(''),
    [bits],
  );

  const popcount = useMemo(
    () => bits.reduce((acc, on) => acc + (on ? 1 : 0), 0),
    [bits],
  );

  const runPerft = useCallback(() => {
    if (timer.current !== null) return;
    setRunning(true);
    setNodes(0);
    let step = 0;
    timer.current = window.setInterval(() => {
      step += 1;
      setCursor(step % 64);
      setNodes((current) => current + 262144);
      if (step >= 96) {
        if (timer.current !== null) window.clearInterval(timer.current);
        timer.current = null;
        setCursor(-1);
        setRunning(false);
      }
    }, 18);
  }, []);

  useEffect(() => {
    const stop = () => {
      painting.current = false;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, []);

  const controls: { label: string; action: () => void }[] = [
    { label: 'ROL', action: () => setBits((p) => [p[63] ?? false, ...p.slice(0, 63)]) },
    { label: 'ROR', action: () => setBits((p) => [...p.slice(1), p[0] ?? false]) },
    { label: 'NOT', action: () => setBits((p) => p.map((b) => !b)) },
    {
      label: 'RND',
      action: () => setBits(() => Array.from({ length: 64 }, () => Math.random() > 0.68)),
    },
    { label: 'CLR', action: () => setBits(() => Array.from({ length: 64 }, () => false)) },
  ];

  const cells: ReactNode[] = [];
  for (let row = 0; row < 8; row += 1) {
    const rank = 8 - row;
    cells.push(
      <div
        key={`rank-${rank}`}
        className="flex items-center justify-center font-mono text-[9px]"
        style={{ color: '#66888A' }}
      >
        {rank}
      </div>,
    );
    for (let file = 0; file < 8; file += 1) {
      const index = (7 - row) * 8 + file;
      const on = bits[index] ?? false;
      const scanning = cursor === index;
      cells.push(
        <motion.button
          key={`cell-${index}`}
          type="button"
          aria-label={`Toggle bit ${index} (${FILES[file]}${rank})`}
          aria-pressed={on}
          onPointerDown={() => {
            const next = !on;
            painting.current = true;
            paintValue.current = next;
            setBit(index, next);
          }}
          onPointerEnter={() => {
            if (painting.current) setBit(index, paintValue.current);
          }}
          onClick={(event) => {
            if (event.detail === 0) setBit(index, !on);
          }}
          whileHover={{ scale: 1.09 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 520, damping: 26 }}
          className="aspect-square w-full rounded-[3px] outline-none focus-visible:ring-2"
          style={{
            background: scanning ? '#8FDDE3' : on ? '#F0AF55' : '#1B2D30',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: scanning
              ? '0 0 14px rgba(143,221,227,0.85)'
              : on
                ? '0 0 12px rgba(240,175,85,0.42)'
                : 'none',
          }}
        />,
      );
    }
  }
  cells.push(<div key="corner" />);
  FILES.forEach((file) => {
    cells.push(
      <div
        key={`file-${file}`}
        className="pt-1 text-center font-mono text-[9px]"
        style={{ color: '#66888A' }}
      >
        {file}
      </div>,
    );
  });

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px]"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(217,79,43,0.18), transparent 70%)',
        }}
      />
      <div
        className="flex items-stretch gap-1.5 rounded-[22px] p-2 md:p-3"
        style={{
          background: '#111C1E',
          border: '1px solid #2C4043',
          boxShadow:
            '0 34px 70px -34px rgba(10,20,22,0.72), inset 0 1px 0 rgba(255,255,255,0.06)',
          touchAction: 'none',
        }}
      >
        <PinRail />
        <div
          className="min-w-0 flex-1 rounded-[14px] px-3 py-3 md:px-4"
          style={{ background: '#142225' }}
        >
          <div
            className="flex items-center justify-between gap-2 border-b pb-3"
            style={{ borderColor: '#2C4043' }}
          >
            <div
              className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] md:text-[10px]"
              style={{ color: '#8FDDE3' }}
            >
              <span
                className="chip-pulse inline-block h-2 w-2 shrink-0"
                style={{ background: 'var(--signal)' }}
              />
              AS-64 / BITBOARD PROBE
            </div>
            <span
              className="hidden font-mono text-[9px] tracking-[0.18em] sm:inline"
              style={{ color: '#66888A' }}
            >
              REV.03 LIVE
            </span>
          </div>

          <div
            className="mt-3 rounded-[9px] px-3 py-2.5"
            style={{ background: '#0A1416', border: '1px solid #2C4043' }}
          >
            <div className="flex items-baseline justify-between">
              <span
                className="font-mono text-[9px] tracking-[0.2em]"
                style={{ color: '#66888A' }}
              >
                U64 WORD
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.2em]"
                style={{ color: '#66888A' }}
              >
                POPCOUNT {String(popcount).padStart(2, '0')}
              </span>
            </div>
            <motion.p
              key={hex}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22 }}
              className="mt-1 font-mono font-bold tracking-[0.1em]"
              style={{ color: 'var(--amber)', fontSize: 'clamp(0.82rem, 2.2vw, 1.3rem)' }}
            >
              0x{hex}
            </motion.p>
          </div>

          <div
            className="mt-3 grid gap-[3px]"
            style={{ gridTemplateColumns: '12px repeat(8, minmax(0, 1fr))' }}
          >
            {cells}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {controls.map((control) => (
              <motion.button
                key={control.label}
                type="button"
                onClick={control.action}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                className="rounded-[6px] py-2 font-mono text-[9px] font-bold tracking-[0.1em]"
                style={{
                  background: '#1B2D30',
                  color: '#8FDDE3',
                  border: '1px solid #2C4043',
                }}
              >
                {control.label}
              </motion.button>
            ))}
          </div>

          <div
            className="mt-3 flex items-center justify-between gap-3 border-t pt-3"
            style={{ borderColor: '#2C4043' }}
          >
            <div>
              <div
                className="font-mono text-[9px] tracking-[0.2em]"
                style={{ color: '#66888A' }}
              >
                PERFT / NODES
              </div>
              <div
                className="mt-0.5 font-mono text-xs font-bold"
                style={{ color: '#8FDDE3' }}
              >
                {nodes.toLocaleString('en-US')}
              </div>
            </div>
            <motion.button
              type="button"
              onClick={runPerft}
              disabled={running}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-[6px] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.14em]"
              style={{
                background: running ? '#2C4043' : 'var(--signal)',
                color: '#FFF6E8',
              }}
            >
              <Activity size={12} />
              {running ? 'SCANNING...' : 'RUN PERFT'}
            </motion.button>
          </div>
        </div>
        <PinRail />
      </div>
      <p
        className="mt-4 flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] md:text-[10px]"
        style={{ color: 'rgba(21,27,28,0.6)' }}
      >
        <span
          className="inline-block h-1.5 w-1.5 shrink-0"
          style={{ background: 'var(--signal)' }}
        />
        TRY PLAYING AROUND IN THIS INTERACTIVE GRID.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  NAVIGATION                                                                */
/* -------------------------------------------------------------------------- */

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        style={{
          background: 'rgba(241,235,221,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="Ayush S — back to top">
            <span
              className="grid h-9 w-9 place-items-center rounded-[10px]"
              style={{ background: 'var(--ink)', color: 'var(--amber)' }}
            >
              <Terminal size={17} strokeWidth={2.2} />
            </span>
            <span className="font-mono text-[10px] leading-[1.4] tracking-[0.18em]">
              <span className="block font-bold">AYUSH S.</span>
              <span className="block opacity-55">HOME</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group inline-flex items-baseline gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-50"
              >
                <span className="text-[8px]" style={{ color: 'var(--signal)' }}>
                  {link.index}
                </span>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className="hidden items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] sm:inline-flex"
              style={{ background: 'var(--signal)', color: '#FFF6E8' }}
            >
              GET IN TOUCH <ArrowUpRight size={13} />
            </a>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-full lg:hidden"
              style={{ border: '1px solid var(--ink)' }}
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden lg:hidden"
            style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}
          >
            <div className="flex flex-col px-5 py-3 md:px-10">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b py-4 font-mono text-[12px] uppercase tracking-[0.18em]"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <span>
                    <span style={{ color: 'var(--signal)' }}>{link.index}</span> / {link.label}
                  </span>
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  HERO                                                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  const rise = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section id="top" className="paper-grid relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-6 h-32 opacity-70">
        <SignalTrace className="h-full w-full" />
      </div>
      <div className="paper-fade pointer-events-none absolute inset-x-0 bottom-0 h-52" />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-5 md:px-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <motion.div
            {...rise}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-8 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]"
          >
            <span
              className="chip-pulse inline-block h-2.5 w-2.5 shrink-0"
              style={{ background: 'var(--signal)' }}
            />
            <span>SYSTEM ONLINE — {PROFILE.location}</span>
          </motion.div>

          <h1
            className="uppercase"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: 0.84,
              fontSize: 'clamp(3.5rem, 9.2vw, 9rem)',
            }}
          >
            <motion.span
              {...rise}
              transition={{ duration: 0.75, delay: 0.05, ease: 'easeOut' }}
              className="block"
            >
              CLOSE TO
            </motion.span>
            <motion.span
              {...rise}
              transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
              className="block"
            >
              THE{' '}
              <em
                className="italic"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  color: 'var(--signal)',
                  letterSpacing: '-0.055em',
                  textTransform: 'none',
                }}
              >
                metal.
              </em>
            </motion.span>
          </h1>

          <motion.div
            {...rise}
            transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <span
              className="rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em]"
              style={{ background: 'var(--ink)', color: 'var(--amber)' }}
            >
              {PROFILE.role}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-50">
              EST. / HYDERABAD, IN
            </span>
          </motion.div>

          <motion.p
            {...rise}
            transition={{ duration: 0.7, delay: 0.36, ease: 'easeOut' }}
            className="mt-8 max-w-[560px] border-l-2 pl-5 text-[15px] leading-[1.7] md:text-[17px]"
            style={{ borderColor: 'var(--signal)', color: 'rgba(21,27,28,0.76)' }}
          >
            <strong style={{ color: 'var(--ink)' }}>
              Electronics &amp; Instrumentation Engineering undergrad at BITS Pilani, Hyderabad
              Campus.
            </strong>{' '}
            Bridging bitwise software engines, embedded microcontrollers, and digital logic —
            all the way down to the last flip-flop.
          </motion.p>

          <motion.div
            {...rise}
            transition={{ duration: 0.7, delay: 0.44, ease: 'easeOut' }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <MagneticLink href="#work" filled>
              VIEW THE BUILDS
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1" />
            </MagneticLink>
            <CopyEmailButton />
          </motion.div>

          <motion.div
            {...rise}
            transition={{ duration: 0.7, delay: 0.52, ease: 'easeOut' }}
            className="mt-14 grid max-w-[560px] grid-cols-3 border-t pt-5"
            style={{ borderColor: 'var(--line)' }}
          >
            {[
              { value: '03', label: 'BUILDS SHIPPED' },
              { value: '08', label: 'TOOLS ON BENCH' },
            ].map((stat) => (
              <div key={stat.label} className="border-l pl-4 first:border-l-0 first:pl-0" style={{ borderColor: 'var(--line)' }}>
                <div
                  className="text-[clamp(1.3rem,2.6vw,2rem)] font-extrabold leading-none tracking-[-0.05em]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </div>
                <div className="mt-1.5 font-mono text-[8px] tracking-[0.16em] opacity-55 md:text-[9px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="lg:col-span-5 lg:pt-2">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.2 }}
          >
            <BitboardProbe />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  TICKER                                                                    */
/* -------------------------------------------------------------------------- */

function Marquee() {
  const line = [
    'JAVA',
    'C',
    'C++',
    'VERILOG',
    'FEDORA LINUX',
    'PLATFORMIO',
    'NEXT.JS',
    'FUSION 360',
    'BITBOARDS',
    'FSMs',
    'OSCILLOSCOPES',
    'VOLLEYBALL',
  ].join('  ✳  ');

  return (
    <div
      className="overflow-hidden py-4"
      style={{ background: 'var(--ink)', color: 'var(--paper)' }}
      aria-label="Tools and interests"
    >
      <div className="marquee-track flex w-max">
        <span className="whitespace-nowrap pr-0 font-mono text-[10px] uppercase tracking-[0.26em]">
          {line}&nbsp;&nbsp;✳&nbsp;&nbsp;
        </span>
        <span
          aria-hidden="true"
          className="whitespace-nowrap pr-0 font-mono text-[10px] uppercase tracking-[0.26em]"
        >
          {line}&nbsp;&nbsp;✳&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ABOUT                                                                     */
/* -------------------------------------------------------------------------- */

function About() {
  const notes = [
    {
      icon: Terminal,
      label: 'TERMINAL FIRST',
      body: 'Most of my day happens in a shell on Fedora. If it can be scripted, it probably should be.',
    },
    {
      icon: Cpu,
      label: 'GATES TO GRIDS',
      body: 'Comfortable dropping from C into Verilog state machines, then back up to a Next.js interface.',
    },
    {
      icon: Activity,
      label: 'OFF THE BENCH',
      body: 'Competitive volleyball player. Same obsession with timing — just on a court instead of a clock.',
    },
  ];

  return (
    <section id="about" className="relative border-t py-24 md:py-32" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeader
          index="01"
          label="THE OPERATOR"
          title={
            <>
              SOFTWARE THAT
              <br />
              RESPECTS THE{' '}
              <em
                className="italic"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  color: 'var(--signal)',
                  textTransform: 'none',
                  letterSpacing: '-0.055em',
                }}
              >
                silicon.
              </em>
            </>
          }
          hint="AN ELECTRONICS & INSTRUMENTATION UNDERGRAD WHO KEEPS ASKING WHAT THE HARDWARE IS ACTUALLY DOING."
        />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="max-w-[720px] leading-[1.45]"
              style={{ fontSize: 'clamp(1.25rem, 2.35vw, 1.95rem)', letterSpacing: '-0.025em' }}
            >
              I like the layer where the abstraction stops being polite. Where a chess move is a
              handful of shifted bits, where a game is a finite state machine, and where an analog
              waveform only becomes useful once you have written the trigger routine yourself.
            </motion.p>

            <div
              className="mt-12 grid gap-px overflow-hidden rounded-[16px] sm:grid-cols-3"
              style={{ background: 'var(--line)', border: '1px solid var(--line)' }}
            >
              {notes.map((note, i) => {
                const Icon = note.icon;
                return (
                  <motion.div
                    key={note.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="group p-6 transition-colors hover:bg-white/40"
                    style={{ background: 'var(--paper)' }}
                  >
                    <Icon size={20} strokeWidth={1.7} style={{ color: 'var(--signal)' }} />
                    <div className="mt-8 font-mono text-[10px] font-bold tracking-[0.18em]">
                      {note.label}
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.6] opacity-65">{note.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7 }}
              className="relative flex h-full min-h-[330px] flex-col overflow-hidden rounded-[18px] p-6 md:p-7"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-50">
                <SignalTrace color="var(--cyan)" className="h-full w-full" />
              </div>
              <div className="relative flex items-center gap-2 font-mono text-[9px] tracking-[0.2em]" style={{ color: '#8FDDE3' }}>
                <Terminal size={13} /> SYS.PROFILE — READ ONLY
              </div>
              <div className="relative mt-8 space-y-4 font-mono text-[11px] leading-[1.7] md:text-[12px]">
                <div>
                  <span style={{ color: 'var(--amber)' }}>$</span> whoami
                  <div className="pl-4 opacity-70">ayush.s — hardware tinkerer</div>
                </div>
                <div>
                  <span style={{ color: 'var(--amber)' }}>$</span> cat /etc/os-release
                  <div className="pl-4 opacity-70">Fedora Linux · workstation</div>
                </div>
                <div>
                  <span style={{ color: 'var(--amber)' }}>$</span> echo $STACK
                  <div className="pl-4 opacity-70">java · c · cpp · verilog · next.js</div>
                </div>
                <div>
                  <span style={{ color: 'var(--amber)' }}>$</span> ps aux | grep curiosity
                  <div className="pl-4" style={{ color: '#8FDDE3' }}>
                    100% — running since day one
                  </div>
                </div>
              </div>
              <div
                className="relative mt-auto flex items-center justify-between border-t pt-4 font-mono text-[9px] tracking-[0.18em]"
                style={{ borderColor: 'rgba(241,235,221,0.16)', color: 'rgba(241,235,221,0.5)' }}
              >
                <span>FEDORA / TERMINAL ENTHUSIAST</span>
                <span>VOLLEYBALL / 06:00 PRACTICE</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PROJECT VISUALS                                                           */
/* -------------------------------------------------------------------------- */

function ChessboardGlyph() {
  const hot = [9, 18, 27, 36, 45, 54, 63];
  return (
    <div
      className="grid w-[120px] shrink-0 rotate-[-6deg] grid-cols-8 gap-[2px] rounded-[8px] p-[6px] md:w-[148px]"
      style={{ background: 'rgba(241,235,221,0.09)', border: '1px solid rgba(241,235,221,0.14)' }}
      aria-hidden="true"
    >
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const light = (row + col) % 2 === 0;
        const isHot = hot.includes(i);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.006, duration: 0.3 }}
            className="aspect-square rounded-[1px]"
            style={{
              background: isHot
                ? 'var(--signal)'
                : light
                  ? 'rgba(241,235,221,0.82)'
                  : 'rgba(241,235,221,0.14)',
            }}
          />
        );
      })}
    </div>
  );
}

function MazeGlyph() {
  return (
    <svg viewBox="0 0 320 160" className="h-[150px] w-full" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <g stroke="rgba(241,235,221,0.15)" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="160" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} />
        ))}
      </g>
      <motion.path
        d="M20 140 H60 V100 H100 V60 H140 V100 H180 V20 H220 V60 H260 V100 H300 V20"
        stroke="#8FDDE3"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="300"
        cy="20"
        r="5"
        fill="#F0AF55"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.7, type: 'spring', stiffness: 260, damping: 16 }}
      />
      <circle cx="20" cy="140" r="4" fill="#F1EBDD" />
    </svg>
  );
}

function ScopeGlyph() {
  const reduce = useReducedMotion();
  return (
    <div
      className="relative w-full overflow-hidden rounded-[12px]"
      style={{ height: 168, background: '#0C1618', border: '1px solid #2C4043' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full" fill="none">
        <defs>
          <pattern id="scope-grid" width="40" height="24" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 0 24" stroke="rgba(143,221,227,0.13)" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="1200" height="120" fill="url(#scope-grid)" />
        <line x1="0" y1="60" x2="1200" y2="60" stroke="rgba(143,221,227,0.25)" strokeDasharray="4 6" />
        <motion.g
          animate={reduce ? { x: 0 } : { x: [0, -600] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        >
          <path d={WAVE_PRIMARY} stroke="#8FDDE3" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d={WAVE_SECONDARY} stroke="#F0AF55" strokeWidth="1.5" strokeOpacity="0.8" vectorEffect="non-scaling-stroke" />
        </motion.g>
      </svg>
      <div
        className="pointer-events-none absolute left-3 top-3 font-mono text-[9px] tracking-[0.18em]"
        style={{ color: '#8FDDE3' }}
      >
        CH1 / 2.00V / 1ms
      </div>
      <div
        className="pointer-events-none absolute bottom-3 right-3 font-mono text-[9px] tracking-[0.18em]"
        style={{ color: '#F0AF55' }}
      >
        TRIG: RISING EDGE
      </div>
    </div>
  );
}

function ProjectVisual({ kind }: { kind: Project['visual'] }) {
  if (kind === 'board') {
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-8 md:justify-start md:gap-14">
        <ChessboardGlyph />
        <div className="font-mono">
          <div className="text-[10px] tracking-[0.22em] opacity-55">PERFT / DEPTH 06</div>
          <div
            className="mt-2 text-[clamp(2.6rem,6vw,5.4rem)] font-extrabold leading-none tracking-[-0.06em]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--amber)' }}
          >
            25M
          </div>
          <div className="mt-2 space-y-1 text-[10px] tracking-[0.16em] opacity-50">
            <div>0x000000000000FFFF</div>
            <div>0x00000000FF00FF00</div>
            <div>0x7F7F7F7F7F7F7F7F</div>
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'maze') return <MazeGlyph />;
  return <ScopeGlyph />;
}

function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const Icon = project.icon;

  return (
    <TiltCard className={cn('group h-full', className)}>
      <motion.article
        initial={{ opacity: 0, y: 46 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: 'spring', stiffness: 88, damping: 18 }}
        className="relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[20px] p-6 md:min-h-[450px] md:p-8"
        style={{ background: project.bg, color: project.fg, border: `1px solid ${project.border}` }}
      >
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.18em] md:text-[10px]">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
              style={{ border: `1px solid ${project.fg}44`, color: project.accent }}
            >
              <Icon size={17} strokeWidth={1.8} />
            </span>
            <span className="opacity-65">
              BLD / {project.index} — {project.kicker}
            </span>
          </div>
          <motion.a
            href="#contact"
            aria-label={`Ask about ${project.title}`}
            whileHover={{ rotate: 45, scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
            style={{ border: `1px solid ${project.fg}55`, color: project.fg }}
          >
            <ArrowUpRight size={17} />
          </motion.a>
        </div>

        <div
          className={cn(
            'relative z-10 flex flex-1 items-center py-8',
            project.visual === 'board' ? 'justify-start' : 'justify-center',
          )}
        >
          <ProjectVisual kind={project.visual} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[600px]">
            <p className="mb-3 font-mono text-[9px] tracking-[0.2em]" style={{ color: project.accent }}>
              {project.metric} <span className="opacity-60">/ {project.metricUnit}</span>
            </p>
            <h3
              className="uppercase"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '-0.045em',
                lineHeight: 0.96,
                fontSize: 'clamp(1.8rem, 3.3vw, 3rem)',
              }}
            >
              {project.title}
            </h3>
            <p className="mt-3 max-w-[560px] text-[13.5px] leading-[1.6] opacity-75 md:text-[14px]">
              {project.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1.5 font-mono text-[9px] tracking-[0.16em]"
                  style={{ border: `1px solid ${project.fg}44`, color: project.fg }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden shrink-0 font-mono text-[9px] tracking-[0.2em] opacity-45 md:block">
            AS — {project.index} / 03
          </div>
        </div>
      </motion.article>
    </TiltCard>
  );
}

function Work() {
  return (
    <section id="work" className="border-t py-24 md:py-32" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeader
          index="02"
          label="SELECTED BUILDS"
          title={
            <>
              THINGS I
              <br />
              PUT ON THE <em
                className="italic"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  color: 'var(--signal)',
                  textTransform: 'none',
                  letterSpacing: '-0.055em',
                }}
              >
                bench.
              </em>
            </>
          }
          hint="THREE BUILDS. EACH ONE STARTED WITH A QUESTION ABOUT WHAT THE HARDWARE IS ACTUALLY DOING."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.index}
              project={project}
              className={cn(
                i === 0 && 'md:col-span-2',
                i === 1 && 'md:col-span-1',
                i === 2 && 'md:col-span-3',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  STACK                                                                     */
/* -------------------------------------------------------------------------- */

function Stack() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setUptime((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const formatted = `${String(Math.floor(uptime / 60)).padStart(2, '0')}:${String(uptime % 60).padStart(2, '0')}`;

  return (
    <section id="stack" className="border-t py-24 md:py-32" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeader
          index="03"
          label="THE BENCH"
          title={
            <>
              TOOLS OF
              <br />
              THE <em
                className="italic"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 400,
                  color: 'var(--signal)',
                  textTransform: 'none',
                  letterSpacing: '-0.055em',
                }}
              >
                trade.
              </em>
            </>
          }
          hint="FROM THE JVM DOWN TO AN ADC REGISTER — AND BACK UP TO A USER INTERFACE."
        />

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-[18px]" style={{ border: '1px solid var(--line)' }}>
              {STACK.map((tool, i) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 120, damping: 20 }}
                  className="group grid grid-cols-[38px_1fr] items-center gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[44px_1.1fr_1fr_150px] md:px-6"
                  style={{
                    borderColor: 'var(--line)',
                    background: 'rgba(255,255,255,0.16)',
                  }}
                >
                  <span className="font-mono text-[10px] opacity-45">0{i + 1}</span>
                  <span className="text-[17px] font-bold tracking-[-0.03em] md:text-[20px]">
                    {tool.name}
                  </span>
                  <span className="hidden font-mono text-[10px] tracking-[0.16em] opacity-55 md:block">
                    {tool.type}
                  </span>
                  <div className="hidden items-center gap-2 md:flex">
                    <div
                      className="h-[6px] flex-1 overflow-hidden rounded-full"
                      style={{ background: 'rgba(21,27,28,0.1)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: i % 2 === 0 ? 'var(--signal)' : 'var(--teal)' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tool.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="font-mono text-[9px] opacity-50">{tool.level}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div
              className="relative h-full overflow-hidden rounded-[18px] p-6 md:p-7"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 opacity-40">
                <SignalTrace color="var(--cyan)" className="h-full w-full" />
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em]" style={{ color: '#8FDDE3' }}>
                  <Cpu size={14} /> BENCH STATUS
                </div>
                <span className="font-mono text-[9px] tracking-[0.16em] opacity-50">UP {formatted}</span>
              </div>

              <div className="relative mt-10 space-y-4">
                {[
                  'FEDORA WORKSTATION / ONLINE',
                  'PLATFORMIO TOOLCHAIN / ARMED',
                  'EDA PLAYGROUND / SIM READY',
                  'OSCILLOSCOPE / TRIGGER SET',
                  'VOLLEYBALL / MATCH DAY',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.09, duration: 0.5 }}
                    className="flex items-center gap-3 border-b pb-3 font-mono text-[10px] tracking-[0.12em] last:border-b-0"
                    style={{ borderColor: 'rgba(241,235,221,0.12)' }}
                  >
                    <Check size={13} style={{ color: '#8FDDE3' }} />
                    <span className="opacity-75">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div
                className="relative mt-10 rounded-[10px] p-4 font-mono text-[10px] leading-[1.8] tracking-[0.1em]"
                style={{ background: '#101D20', border: '1px solid rgba(143,221,227,0.24)' }}
              >
                <span style={{ color: 'var(--amber)' }}>NOTE:</span> every tool here has been used
                to make something that blinks, computes, or draws a waveform.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CONTACT + FOOTER                                                          */
/* -------------------------------------------------------------------------- */

function Contact() {
  return (
    <footer id="contact" className="relative overflow-hidden" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
      <div className="paper-grid pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 w-[1200px] -translate-x-1/2 opacity-40">
        <SignalTrace color="var(--signal)" className="h-40 w-full" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]"
        >
          <span className="chip-pulse inline-block h-2.5 w-2.5" style={{ background: 'var(--signal)' }} />
          04 / OPEN CHANNEL
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          className="mt-8 uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '-0.06em',
            lineHeight: 0.86,
            fontSize: 'clamp(3rem, 9vw, 8.5rem)',
          }}
        >
          LET&apos;S BUILD
          <br />
          SOMETHING{' '}
          <em
            className="italic"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              color: 'var(--signal)',
              textTransform: 'none',
              letterSpacing: '-0.055em',
            }}
          >
            real.
          </em>
        </motion.h2>

        <p className="mt-9 max-w-[540px] text-[15px] leading-[1.7] opacity-65 md:text-[17px]">
          Have a stubborn firmware bug, an FPGA idea, or a chess engine that needs to go faster?
          My inbox is open — and I read every message.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <MagneticLink href={`mailto:${PROFILE.email}`} filled>
            <Mail size={15} />
            SAY HELLO
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1" />
          </MagneticLink>
          <CopyEmailButton dark />
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <motion.a
            href={PROFILE.github}
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 rounded-full px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ border: '1px solid rgba(241,235,221,0.3)' }}
          >
            <GitHubIcon className="h-4 w-4" />
            GITHUB
            <ExternalLink size={13} style={{ opacity: 0.6 }} />
          </motion.a>
          <motion.a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 rounded-full px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ border: '1px solid rgba(241,235,221,0.3)' }}
          >
            LINKEDIN
            <ArrowUpRight size={13} style={{ opacity: 0.6 }} />
          </motion.a>
        </div>

        <div
          className="mt-20 flex flex-col gap-4 border-t pt-6 font-mono text-[9px] tracking-[0.16em] md:flex-row md:items-center md:justify-between md:text-[10px]"
          style={{ borderColor: 'rgba(241,235,221,0.16)' }}
        >
          <span className="opacity-60">© 2026 Ayush S. No cookies, no trackers, zero bloat.</span>
          <span className="inline-flex items-center gap-2 opacity-60">
            <Terminal size={13} /> {PROFILE.location}
          </span>
          <a href="#top" className="inline-flex items-center gap-2 transition-opacity hover:opacity-60">
            BACK TO TOP <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  PAGE                                                                      */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    document.title = `${PROFILE.name} — ${PROFILE.role}`;
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full origin-left"
        style={{ scaleX: progress, background: 'var(--signal)' }}
      />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Stack />
      </main>
      <Contact />
    </div>
  );
}
