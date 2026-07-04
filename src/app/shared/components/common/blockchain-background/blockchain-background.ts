import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Input,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Real 3D blockchain backdrop rendered on <canvas>.
 *
 * A rotating cloud of "blocks" (mini cubes) is projected with true perspective,
 * linked into a chain by animated connectors, with "transaction" pulses that
 * travel block-to-block. Royal-blue palette in both themes:
 *   - Day   : white canvas + royal-blue lattice
 *   - Night : black canvas + royal-blue / white lattice
 *
 * Pure requestAnimationFrame, DPR-aware (4K crisp), pauses when the tab is
 * hidden and honors prefers-reduced-motion. No external 3D dependency.
 *
 * THEME:
 * Angular has no built-in equivalent of next-themes. This component figures
 * out light/dark two ways, in priority order:
 *   1. The `theme` @Input(), if you pass 'light' | 'dark' explicitly.
 *   2. Otherwise, it watches `document.documentElement` for a `dark` class
 *      (the common Tailwind dark-mode convention) via MutationObserver, and
 *      falls back to `prefers-color-scheme` on first paint.
 * Wire your own theme service into the `theme` input if you have one.
 */

type Vec3 = { x: number; y: number; z: number };

interface Block {
  pos: Vec3;
  size: number;
  phase: number; // for idle pulsing
  speed: number;
}

interface Pulse {
  from: number;
  to: number;
  t: number;
  speed: number;
}

const BLOCK_COUNT = 26;
const LINK_DISTANCE = 230; // world units before projection
const MAX_LINKS_PER_BLOCK = 3;

@Component({
  selector: 'app-blockchain-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bgcanvas">
      <!-- Theme-aware base wash + grid (CSS, cheap) -->
      <div class="absolute inset-0 bg-grid animate-grid-pan opacity-60 dark:opacity-40"></div>
      <div class="absolute -top-40 -left-32 h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-[150px] animate-aurora dark:bg-blue-500/20"></div>
      <div class="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full bg-indigo-500/10 blur-[150px] animate-aurora [animation-delay:-6s] dark:bg-indigo-500/20"></div>
      <div class="absolute bottom-0 left-1/3 h-[34rem] w-[34rem] rounded-full bg-blue-400/10 blur-[150px] animate-aurora [animation-delay:-12s] dark:bg-blue-500/15"></div>

      <!-- The real 3D blockchain -->
      <canvas #canvas class="absolute inset-0 h-full w-full" aria-hidden="true"></canvas>

      <!-- Vignette to keep foreground crisp (theme-aware via CSS var) -->
      <div class="absolute inset-0 bg-vignette"></div>
    </div>
  `,
})
export class BlockchainBackgroundComponent implements AfterViewInit, OnDestroy {
  /** Optional explicit theme override. If omitted, dark mode is auto-detected. */
  @Input() theme?: 'light' | 'dark';

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private currentTheme: 'light' | 'dark' = 'light';
  private themeObserver?: MutationObserver;

  private raf = 0;
  private running = true;
  private resizeHandler = () => this.resize();
  private visibilityHandler = () => this.onVisibility();

  private ctx!: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private reduceMotion = false;

  private blocks: Block[] = [];
  private links: Array<[number, number]> = [];
  private pulses: Pulse[] = [];
  private rot = 0;
  private last = 0;

  private readonly FOV = 620;
  private readonly CAM_Z = 820;

  private readonly CUBE: number[][] = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  private readonly EDGES: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    this.ctx = ctx;

    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.setupTheme();
    this.resize();
    this.buildScene();

    this.last = performance.now();
    this.raf = requestAnimationFrame((t) => this.draw(t));

    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.running = false;
    if (typeof cancelAnimationFrame === 'function' && this.raf) {
      cancelAnimationFrame(this.raf);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.themeObserver?.disconnect();
  }

  // ---- Theme detection -----------------------------------------------------

  private setupTheme(): void {
    if (this.theme) {
      this.currentTheme = this.theme;
      return;
    }
    const computeFromDom = () =>
      document.documentElement.classList.contains('dark')
        ? 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    this.currentTheme = computeFromDom();

    this.themeObserver = new MutationObserver(() => {
      this.currentTheme = computeFromDom();
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // ---- Setup -----------------------------------------------------------

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5); // cap for 4K perf
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = Math.floor(this.width * this.dpr);
    canvas.height = Math.floor(this.height * this.dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private buildScene(): void {
    // ---- Build a pseudo-random but stable lattice of blocks -----------------
    let seed = 1337;
    const rand = () => {
      // deterministic LCG so layout is stable across reloads
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const spread = 520;
    this.blocks = Array.from({ length: BLOCK_COUNT }, () => ({
      pos: {
        x: (rand() - 0.5) * spread * 1.8,
        y: (rand() - 0.5) * spread,
        z: (rand() - 0.5) * spread,
      },
      size: 14 + rand() * 16,
      phase: rand() * Math.PI * 2,
      speed: 0.6 + rand() * 0.8,
    }));

    // Pre-compute static links (nearest neighbours) → chain topology
    const links: Array<[number, number]> = [];
    const linkSet = new Set<string>();
    for (let i = 0; i < this.blocks.length; i++) {
      const dists = this.blocks
        .map((b, j) => ({ j, d: this.dist3(this.blocks[i].pos, b.pos) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, MAX_LINKS_PER_BLOCK);
      for (const { j, d } of dists) {
        if (d > LINK_DISTANCE * 1.6) continue;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push([i, j]);
        }
      }
    }
    this.links = links;

    // Transaction pulses traveling along links
    this.pulses = this.links.slice(0, 9).map((l) => ({
      from: l[0],
      to: l[1],
      t: rand(),
      speed: 0.12 + rand() * 0.18,
    }));
  }

  // ---- Math helpers -------------------------------------------------------

  private dist3(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private project(p: Vec3) {
    const z = p.z + this.CAM_Z;
    const scale = this.FOV / Math.max(z, 1);
    return {
      x: this.width / 2 + p.x * scale,
      y: this.height / 2 + p.y * scale,
      scale,
      z,
    };
  }

  private rotateY(p: Vec3, a: number): Vec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
  }

  private rotateX(p: Vec3, a: number): Vec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
  }

  private clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
  }

  private palette() {
    const dark = this.currentTheme === 'dark';
    return {
      royal: dark ? '79, 122, 255' : '37, 99, 235', // a touch brighter on black
      indigo: dark ? '129, 140, 248' : '79, 70, 229',
      line: dark ? '99, 130, 246' : '37, 99, 235',
      node: dark ? '147, 170, 255' : '37, 99, 235',
      glow: dark ? '79, 122, 255' : '59, 110, 235',
    };
  }

  // ---- Render loop ----------------------------------------------------------

  private draw = (now: number): void => {
    const ctx = this.ctx;
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    if (!this.reduceMotion) this.rot += dt * 0.14;

    ctx.clearRect(0, 0, this.width, this.height);
    const c = this.palette();

    // Tilt the whole scene slightly for a 3D "isometric" feel
    const tilt = -0.32;
    const transformed = this.blocks.map((b) => {
      let p = this.rotateY(b.pos, this.rot);
      p = this.rotateX(p, tilt);
      return { block: b, world: p, proj: this.project(p) };
    });

    // ---- Draw chain connectors (depth-sorted, faded by distance) ---------
    ctx.lineCap = 'round';
    for (const [i, j] of this.links) {
      const a = transformed[i];
      const b = transformed[j];
      const pa = a.proj;
      const pb = b.proj;
      const depth = (a.world.z + b.world.z) / 2;
      const fade = this.clamp(1 - (depth + 520) / 1500, 0.06, 0.55);
      ctx.strokeStyle = `rgba(${c.line}, ${fade})`;
      ctx.lineWidth = this.clamp(1.4 * ((pa.scale + pb.scale) / 2), 0.5, 2.4);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    // ---- Transaction pulses along the chain ------------------------------
    if (!this.reduceMotion) {
      for (const pulse of this.pulses) {
        pulse.t += dt * pulse.speed;
        if (pulse.t > 1) {
          pulse.t = 0;
          // hop to a new random outgoing link from the destination
          const next = this.links.find((l) => l[0] === pulse.to || l[1] === pulse.to);
          if (next) {
            pulse.from = pulse.to;
            pulse.to = next[0] === pulse.to ? next[1] : next[0];
          }
        }
        const a = transformed[pulse.from].proj;
        const b = transformed[pulse.to].proj;
        const x = a.x + (b.x - a.x) * pulse.t;
        const y = a.y + (b.y - a.y) * pulse.t;
        const r = 2.6 * ((a.scale + b.scale) / 2 + 0.4);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, `rgba(${c.glow}, 0.9)`);
        g.addColorStop(1, `rgba(${c.glow}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- Draw the blocks (cubes), far-to-near ----------------------------
    const order = transformed
      .map((t, idx) => ({ idx, z: t.world.z }))
      .sort((p, q) => q.z - p.z);

    for (const { idx } of order) {
      const t = transformed[idx];
      const b = t.block;
      const pulse = this.reduceMotion ? 1 : 1 + Math.sin((now / 1000) * b.speed + b.phase) * 0.08;
      const s = b.size * pulse;
      const depth = t.world.z;
      const fade = this.clamp(1 - (depth + 520) / 1400, 0.12, 0.95);

      // Project the cube corners: spin the cube locally, place it at the
      // block's world position, then apply the SAME scene rotation/tilt as
      // the nodes so cubes stay locked to their links.
      const pts = this.CUBE.map(([cx, cy, cz]) => {
        let p: Vec3 = { x: cx * s, y: cy * s, z: cz * s };
        p = this.rotateY(p, this.rot * 1.3 + b.phase);
        p = this.rotateX(p, b.phase * 0.5);
        let wp: Vec3 = { x: p.x + b.pos.x, y: p.y + b.pos.y, z: p.z + b.pos.z };
        wp = this.rotateY(wp, this.rot);
        wp = this.rotateX(wp, tilt);
        return this.project(wp);
      });

      // edges
      ctx.strokeStyle = `rgba(${c.royal}, ${fade})`;
      ctx.lineWidth = this.clamp(1.3 * t.proj.scale, 0.5, 2.2);
      ctx.beginPath();
      for (const [e0, e1] of this.EDGES) {
        ctx.moveTo(pts[e0].x, pts[e0].y);
        ctx.lineTo(pts[e1].x, pts[e1].y);
      }
      ctx.stroke();

      // glowing core node at the block center
      const center = t.proj;
      const nr = this.clamp(3.2 * center.scale, 1, 5);
      const g = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, nr * 5);
      g.addColorStop(0, `rgba(${c.node}, ${0.9 * fade})`);
      g.addColorStop(1, `rgba(${c.node}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(center.x, center.y, nr * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${c.node}, ${fade})`;
      ctx.beginPath();
      ctx.arc(center.x, center.y, nr, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.running) this.raf = requestAnimationFrame((tm) => this.draw(tm));
  };

  private onVisibility(): void {
    if (document.hidden) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    } else if (!this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame((t) => this.draw(t));
    }
  }
}