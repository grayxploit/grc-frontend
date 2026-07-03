import { Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.html',
  styleUrl: './countdown.css'
})
export class Countdown implements AfterViewInit, OnDestroy {
  readonly applicationName = environment.applicationName;
  private countdownIntervalId: any;
  private animationFrameId: any;
  private resizeListener: any;
  private mouseMoveListener: any;

  // Three.js instances
  private renderer: any;
  private scene: any;
  private camera: any;
  private mesh: any;
  private ring: any;
  private ring2: any;
  private particles: any;

  // Lists of elements for event listener cleanup
  private hoverElements: NodeListOf<Element> | null = null;
  private magneticButtons: NodeListOf<Element> | null = null;
  private frameworks: NodeListOf<Element> | null = null;
  private faqItems: NodeListOf<Element> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadScripts();
      this.startLoaderAnimation();
    }
  }

  private async loadScripts(): Promise<void> {
    try {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js');
    } catch (e) {
      console.error('Failed to load countdown page visual scripts:', e);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  private startLoaderAnimation() {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loadBar');
    const app = document.getElementById('app');
    const gsap = (window as any).gsap;

    if (gsap && loader && bar && app) {
      gsap.timeline()
        .to(bar, { width: '100%', duration: 2.2, ease: "power3.inOut" })
        .to('#loadStatus', { text: 'Ready', duration: 0.5 })
        .to(loader, {
          opacity: 0,
          duration: 0.8,
          onComplete: () => {
            loader.style.display = 'none';
            app.classList.remove('opacity-0');
            app.style.opacity = '1';
            this.startCountdown();
            this.initAnim();
            this.initThreeJs();
            this.initInteractiveListeners();
          }
        });
    } else {
      // Fallback in case scripts failed to load
      if (loader) loader.style.display = 'none';
      if (app) {
        app.classList.remove('opacity-0');
        app.style.opacity = '1';
      }
      this.startCountdown();
    }
  }

  private startCountdown() {
    const launch = new Date('July 7, 2026 00:00:00').getTime();
    const tick = () => {
      const dist = launch - Date.now();
      const daysEl = document.getElementById('days');
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');

      if (dist < 0) {
        if (daysEl) daysEl.innerText = '00';
        if (hoursEl) hoursEl.innerText = '00';
        if (minutesEl) minutesEl.innerText = '00';
        if (secondsEl) secondsEl.innerText = '00';
        clearInterval(this.countdownIntervalId);
        return;
      }

      if (daysEl) daysEl.innerText = String(Math.floor(dist / (1000 * 60 * 60 * 24))).padStart(2, '0');
      if (hoursEl) hoursEl.innerText = String(Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      if (minutesEl) minutesEl.innerText = String(Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      if (secondsEl) secondsEl.innerText = String(Math.floor((dist % (1000 * 60)) / 1000)).padStart(2, '0');
    };
    tick();
    this.countdownIntervalId = setInterval(tick, 1000);
  }

  private initAnim() {
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.surface-elevated, .surface-card').forEach((el: any, i: number) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.05,
        ease: "power3.out"
      });
    });

    document.querySelectorAll('.counter').forEach((el: any) => {
      const target = +el.dataset.target;
      gsap.fromTo(el, 
        { innerText: 0 }, 
        { 
          innerText: target, 
          duration: 2.5, 
          snap: { innerText: 1 }, 
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      );
    });
  }

  private initThreeJs() {
    const THREE = (window as any).THREE;
    const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
    if (!THREE || !canvas) return;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 7;

    // Minimal geometric sculpture
    const geo = new THREE.IcosahedronGeometry(1.3, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd4a853, wireframe: true, transparent: true, opacity: 0.12 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.mesh);

    const ringGeo = new THREE.TorusGeometry(1.8, 0.015, 32, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4a853, transparent: true, opacity: 0.25 });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.ring);

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.01, 16, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    this.ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.scene.add(this.ring2);

    const pGeo = new THREE.BufferGeometry();
    const pCount = 400;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.02, color: 0xd4a853, transparent: true, opacity: 0.4 });
    this.particles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.particles);

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      if (this.mesh) {
        this.mesh.rotation.y += 0.0015;
        this.mesh.rotation.x += 0.0008;
      }
      if (this.ring) {
        this.ring.rotation.x += 0.0006;
        this.ring.rotation.y += 0.001;
      }
      if (this.ring2) {
        this.ring2.rotation.z += 0.0005;
      }
      if (this.particles) {
        this.particles.rotation.y -= 0.0002;
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    this.resizeListener = () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private initInteractiveListeners() {
    const gsap = (window as any).gsap;
    if (!gsap) return;

    // Pointer cursor movement
    const cursor = document.getElementById('cursor');
    if (cursor) {
      this.mouseMoveListener = (e: MouseEvent) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.2, ease: "power2.out" });
      };
      document.addEventListener('mousemove', this.mouseMoveListener);

      this.hoverElements = document.querySelectorAll('button, .faq-item, .surface-card, .surface-elevated, a');
      this.hoverElements.forEach(el => {
        el.addEventListener('mouseenter', this.onMouseEnterCursor);
        el.addEventListener('mouseleave', this.onMouseLeaveCursor);
      });
    }

    // Magnetic buttons
    this.magneticButtons = document.querySelectorAll('.magnetic-btn');
    this.magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', this.onMouseMoveMagnetic);
      btn.addEventListener('mouseleave', this.onMouseLeaveMagnetic);
    });

    // Framework scale hover
    this.frameworks = document.querySelectorAll('#frameworkContainer span');
    this.frameworks.forEach(el => {
      el.addEventListener('mouseenter', this.onMouseEnterFramework);
      el.addEventListener('mouseleave', this.onMouseLeaveFramework);
    });

    // FAQ Accordion
    this.faqItems = document.querySelectorAll('.faq-item');
    this.faqItems.forEach(item => {
      item.addEventListener('click', this.onClickFaq);
    });
  }

  private onMouseEnterCursor = () => {
    const cursor = document.getElementById('cursor');
    if (cursor) cursor.classList.add('hover');
  };

  private onMouseLeaveCursor = () => {
    const cursor = document.getElementById('cursor');
    if (cursor) cursor.classList.remove('hover');
  };

  private onMouseMoveMagnetic = (e: Event) => {
    const gsap = (window as any).gsap;
    if (!gsap) return;
    const btn = e.currentTarget as HTMLElement;
    const r = btn.getBoundingClientRect();
    const mouseEvent = e as MouseEvent;
    gsap.to(btn, {
      x: (mouseEvent.clientX - r.left - r.width / 2) * 0.25,
      y: (mouseEvent.clientY - r.top - r.height / 2) * 0.25,
      duration: 0.5
    });
  };

  private onMouseLeaveMagnetic = (e: Event) => {
    const gsap = (window as any).gsap;
    if (!gsap) return;
    const btn = e.currentTarget as HTMLElement;
    gsap.to(btn, { x: 0, y: 0, duration: 0.5 });
  };

  private onMouseEnterFramework = (e: Event) => {
    const gsap = (window as any).gsap;
    if (!gsap) return;
    const el = e.currentTarget as HTMLElement;
    gsap.to(el, { scale: 1.05, borderColor: 'rgba(212,168,83,0.3)', duration: 0.4 });
  };

  private onMouseLeaveFramework = (e: Event) => {
    const gsap = (window as any).gsap;
    if (!gsap) return;
    const el = e.currentTarget as HTMLElement;
    gsap.to(el, { scale: 1, borderColor: 'rgba(255,255,255,0.05)', duration: 0.4 });
  };

  private onClickFaq = (e: Event) => {
    const item = e.currentTarget as HTMLElement;
    const a = item.querySelector('.faq-icon') as HTMLElement;
    if (a) {
      a.style.transform = a.style.transform === 'rotate(45deg)' ? '' : 'rotate(45deg)';
    }
  };

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      // Clear timers
      if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

      // Remove window events
      if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
      if (this.mouseMoveListener) document.removeEventListener('mousemove', this.mouseMoveListener);

      // Remove interactive element events
      if (this.hoverElements) {
        this.hoverElements.forEach(el => {
          el.removeEventListener('mouseenter', this.onMouseEnterCursor);
          el.removeEventListener('mouseleave', this.onMouseLeaveCursor);
        });
      }
      if (this.magneticButtons) {
        this.magneticButtons.forEach(btn => {
          btn.removeEventListener('mousemove', this.onMouseMoveMagnetic);
          btn.removeEventListener('mouseleave', this.onMouseLeaveMagnetic);
        });
      }
      if (this.frameworks) {
        this.frameworks.forEach(el => {
          el.removeEventListener('mouseenter', this.onMouseEnterFramework);
          el.removeEventListener('mouseleave', this.onMouseLeaveFramework);
        });
      }
      if (this.faqItems) {
        this.faqItems.forEach(item => {
          item.removeEventListener('click', this.onClickFaq);
        });
      }

      // Dispose Three.js objects
      if (this.renderer) {
        try {
          this.renderer.dispose();
        } catch (e) {
          console.warn('Three.js renderer dispose error:', e);
        }
      }
    }
  }
}
