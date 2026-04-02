import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { MoveLeft } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, Observer);

// --- Constants & Data ---
const KEYWORDS = ['ABOUT', 'CONTACT', 'WEBSITE DESIGN', 'PROJECTS', 'SERVICES', 'SKILLS'];

const SECTION_CONTENT = {
  'ABOUT': {
    title: "Digital Artist & Interactive Designer",
    paragraphs: [
      "I Am A Digital Artist And Interactive Designer Working With AI, Code, And Web-based Media.",
      "My Artistic Work Critically Examples The Blind Acceptance Of systems And Predefined structures That Shape Modern Society, Creating Subtle Discomfort Within familiar Environments.",
      "Alongside My Artistic Practice, I Collaboration With Clients On Web Design, Visual Art, And Digital Experiences."
    ],
    awards: [
      { label: "CSS Design Awards — Website Of The Day, 2026" }
    ],
    education: [
      { label: "Kookmin University — Visual Communication Design [2025-]" }
    ],
    inquiries: "exortrisolar@gmail.com"
  },
  'CONTACT': [
    { label: 'INSTAGRAM', desc: '@EXOR_VISION', href: '#' },
    { label: 'X', desc: '/TRISOLAR_TECH', href: '#' },
    { label: 'LINKEDIN', desc: 'IN/EXORT-PORTFOLIO', href: '#' },
    { label: 'EMAIL', desc: 'EXORTRISOLAR@GMAIL.COM', href: 'mailto:exortrisolar@gmail.com' }
  ],
  'WEBSITE DESIGN': [
    { label: 'SYSTEM ARCHITECTURE', desc: 'SCALABLE 3D RENDERING.' },
    { label: 'MOTION LOGIC', desc: 'COMPLEX GSAP TRANSFORMATIONS.' },
    { label: 'UI SYSTEMS', desc: 'MODERN REACT ARCHITECTURE.' }
  ],
  'PROJECTS': [
    { 
      title: 'AETHER', 
      year: '2024', 
      type: 'SOLO PROJECT', 
      desc: 'IMMERSIVE MEDIA INSTALLATION EXPLORING THE DIGITAL VOID.',
      img: '/project_aether_digital_void_1775135313073.png'
    },
    { 
      title: 'NEON', 
      year: '2024', 
      type: 'TEAM PROJECT', 
      desc: 'HIGH-FIDELITY CYBER-PUNK DATA VISUALIZATION DASHBOARD.',
      img: '/project_neon_dashboard_1775135362919.png'
    },
    { 
      title: 'FLUX', 
      year: '2023', 
      type: 'INTERACTIVE', 
      desc: 'LIQUID UI EXPERIMENT DRIVEN BY REAL-TIME MOTION PHYSICS.',
      img: '/project_flux_liquid_ui_1775135434834.png'
    },
    { 
      title: 'NOVA', 
      year: '2025', 
      type: 'CORE INTERFACE', 
      desc: 'HOLOGRAPHIC DATA VISUALIZATION FOR DISTRIBUTED SYSTEMS.',
      img: '/project_nova_interface_1775138377373.png'
    },
    { 
      title: 'ORBIT', 
      year: '2025', 
      type: 'DEEP SPACE', 
      desc: 'TECHNICAL SCHEMATICS FOR ORBITAL PLANETARY VISUALIZATION.',
      img: '/project_orbit_system_1775138424908.png'
    }
  ],
  'SERVICES': [
    { label: 'EXPERIENCE DESIGN', desc: 'INTERACTIVE CINEMATIC NARRATIVES.' },
    { label: 'CREATIVE CODE', desc: 'THREE.JS & WEBGL PERFORMANCE.' },
    { label: 'STRATEGIC BRANDING', desc: 'TECHNICAL PRODUCT IDENTITY.' }
  ],
  'SKILLS': [
    { label: 'TECHNICAL STACK', desc: 'REACT 19 / THREE.JS / GSAP 3' },
    { label: 'VISUAL SYSTEM', desc: 'TAILWIND CSS / SHADCN UI' },
    { label: 'PIPELINE', desc: 'VITE / FIGMA / BLENDER' }
  ]
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100000] bg-black text-red-500 flex flex-col justify-center items-center font-mono p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">SYSTEM CRASH ALERT</h2>
          <p className="text-sm opacity-60 mb-8 max-w-lg">{this.state.error && this.state.error.message}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 border border-red-500 text-xs hover:bg-red-500 hover:text-black transition-all">MANUAL REBOOT</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- UI Components ---
const TopNav = ({ text = "BASIT", onClick }) => (
  <div className="fixed top-[18px] left-[20px] z-[1010] pointer-events-auto">
    <button onClick={onClick} className="inline-block p-0 border-0 bg-transparent cursor-pointer text-[0.85rem] font-medium tracking-[0.12em] uppercase text-white/80 transition-all duration-350 hover:text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>{text}</button>
  </div>
);

const LogItem = ({ log }) => (
  <div className="whitespace-nowrap font-mono text-[9px] leading-[1.35] tracking-[0.02em] text-white/90 uppercase">
    <span className="text-white/40 opacity-70">{'> '}</span>{log.time} {log.message}
  </div>
);

const ActionLog = ({ logs }) => (
  <div className="fixed left-[18px] bottom-[18px] z-10 flex flex-col gap-1 pointer-events-none">
    {logs.slice().reverse().map((log) => <LogItem key={log.id} log={log} />)}
  </div>
);

const CursorCoords = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => setCoords({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  return (
    <div className="fixed bottom-[24px] right-[24px] z-[1010] font-mono text-[11px] tracking-[0.25em] text-white/50 uppercase pointer-events-none">
      <span className="opacity-30 mr-3">X</span>{coords.x.toString().padStart(4, '0')} 
      <span className="opacity-30 ml-6 mr-3">Y</span>{coords.y.toString().padStart(4, '0')}
    </div>
  );
};

const CursorTrail = () => {
  const cursorRefs = useRef([]);
  useEffect(() => {
    document.body.style.cursor = 'none';
    const onMouseMove = (e) => {
      cursorRefs.current.forEach((el, i) => {
        if (!el) return;
        const delay = i === 0 ? 0.08 : 0.2 + i * 0.12;
        gsap.to(el, { x: e.clientX - 7, y: e.clientY - 7, duration: delay, ease: "power2.out" });
      });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => { window.removeEventListener('mousemove', onMouseMove); document.body.style.cursor = 'auto'; };
  }, []);
  return (
    <div className="fixed inset-0 z-[1100] pointer-events-none">
      {[...Array(10)].map((_, index) => (
        <div key={index} ref={(el) => cursorRefs.current[index] = el} className="fixed top-0 left-0 bg-white mix-blend-difference pointer-events-none opacity-100 will-change-transform w-[14px] h-[14px]" />
      ))}
    </div>
  );
};

// --- Section Layouts ---

const CloseButton = ({ onClick }) => (
  <div className="fixed top-[18px] right-[24px] z-[2000] pointer-events-auto">
    <button onClick={onClick} className="group flex items-center gap-3 text-[0.7rem] tracking-[0.3em] text-white/60 hover:text-white transition-all uppercase px-4 py-2 bg-transparent border-0 appearance-none cursor-pointer">
      <MoveLeft className="w-5 h-5 group-hover:-translate-x-3 transition-transform duration-500" />
    </button>
  </div>
);

const AboutLayout = ({ data }) => (
  <div className="w-full h-full flex items-center justify-center pt-20 pb-20 overflow-visible pointer-events-none px-10">
    <div className="w-full max-w-[1300px] grid grid-cols-12 gap-10 relative pointer-events-auto">
      <div className="col-span-8 text-left">
        <h2 className="text-[4.5vw] font-medium leading-[1.05] tracking-tight mb-16 text-white overflow-hidden" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {data.title.split(' ').map((word, i) => <span key={i} className="inline-block mr-4 reveal-text">{word}</span>)}
        </h2>
        <div className="space-y-8 max-w-[500px]">
          {data.paragraphs.map((p, i) => <p key={i} className="text-[1.1rem] leading-relaxed text-white/50 reveal-p" style={{ fontFamily: "'Inter', sans-serif" }}>{p}</p>)}
        </div>
      </div>
      <div className="col-span-4 flex flex-col justify-end pb-12 space-y-12 text-right self-end">
        <div className="space-y-4"><h4 className="text-[0.6rem] tracking-[0.5em] text-white/10 uppercase">SELECTED AWARDS</h4>{data.awards.map((a, i) => <p key={i} className="text-[0.75rem] text-white/60 tracking-wider translate-y-0">{a.label}</p>)}</div>
        <div className="space-y-4"><h4 className="text-[0.6rem] tracking-[0.5em] text-white/10 uppercase">EDUCATION</h4>{data.education.map((e, i) => <p key={i} className="text-[0.75rem] text-white/60 tracking-wider translate-y-0">{e.label}</p>)}</div>
        <div className="space-y-4"><h4 className="text-[0.6rem] tracking-[0.5em] text-white/10 uppercase">INQUIRIES</h4><p className="text-[0.75rem] text-white/60 underline underline-offset-8 decoration-white/10">{data.inquiries}</p></div>
      </div>
    </div>
  </div>
);

const ProjectLayout = ({ data, horizontalRef, titleRef }) => (
  <div className="w-full h-screen flex items-center justify-start overflow-hidden relative">
    <div className="fixed top-[15%] left-[5%] right-[5%] h-[1px] bg-white/20 z-30" />
    <div ref={titleRef} className="fixed left-0 top-0 bottom-0 w-[45vw] z-20 pointer-events-none flex items-center pl-20 bg-gradient-to-r from-black via-black 70% to-transparent">
      <h2 className="section-title-gradient text-[8.5vw] font-bold tracking-tighter leading-[0.8] uppercase opacity-100 flex flex-col">
        <span>PROJECTS</span>
      </h2>
    </div>
    <div ref={horizontalRef} className="flex items-center gap-[45vw] pl-[65vw] pr-[40vw] h-full will-change-transform z-10">
      {data.map((proj, i) => (
        <div key={i} className="timeline-item group flex flex-col gap-10 shrink-0 mt-10">
          <div className="flex justify-between items-end border-b border-white/5 pb-4"><span className="text-[0.6rem] tracking-[0.6em] text-white/20 uppercase">{proj.type}</span><span className="text-[0.6rem] tracking-[0.6em] text-white/20 uppercase">{proj.year}</span></div>
          <div className="relative overflow-hidden w-[650px] h-[380px] bg-white/5 border border-white/10"><img src={proj.img} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1000ms] group-hover:scale-105" alt={proj.title} /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /></div>
          <div className="space-y-6"><h3 className="text-[2.8rem] font-medium tracking-[0.1em] text-white uppercase leading-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>{proj.title}</h3><p className="text-[0.7rem] tracking-[0.3em] text-white/30 uppercase max-w-[450px] leading-relaxed reveal-detail">{proj.desc}</p></div>
        </div>
      ))}
    </div>
  </div>
);

const DefaultLayout = ({ sectionName, data, horizontalRef, titleRef }) => (
  <div className="w-full h-screen flex items-center overflow-hidden relative">
    <div className="fixed top-[15%] left-[5%] right-[5%] h-[1px] bg-white/20 z-30" />
    <div ref={titleRef} className="fixed left-0 top-0 bottom-0 w-[45vw] z-20 pointer-events-none flex items-center pl-20 bg-gradient-to-r from-black via-black 70% to-transparent">
      <h2 className="section-title-gradient text-[8.5vw] font-bold tracking-tighter leading-[0.8] uppercase opacity-100 flex flex-col">
        {sectionName.split(' ').map((word, i) => <span key={i}>{word}</span>)}
      </h2>
    </div>
    <div ref={horizontalRef} className="flex items-center gap-[30vw] pl-[65vw] pr-[30vw] h-full will-change-transform z-10">
      {data.map((item, i) => (
        <div key={i} className="timeline-item flex flex-col gap-8 group shrink-0">
          <div className="flex items-center gap-8"><div className="w-3 h-3 rounded-full bg-white group-hover:scale-150 transition-all duration-700 shadow-[0_0_15px_rgba(255,255,255,0.4)]" /><h3 className="text-[2.6rem] font-medium tracking-[0.2em] text-white/80 group-hover:text-white transition-all uppercase whitespace-nowrap" style={{ fontFamily: "'Orbitron', sans-serif" }}>{item.label}</h3></div>
          <p className="pl-11 text-[0.7rem] tracking-[0.3em] text-white/30 uppercase max-w-[300px] leading-relaxed reveal-detail">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const SectionOverlay = ({ sectionName, onClose }) => {
  const containerRef = useRef(null);
  const horizontalRef = useRef(null);
  const titleRef = useRef(null);
  const scrollProgress = useRef(0);
  const content = SECTION_CONTENT[sectionName];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Blur entrance
      gsap.fromTo(containerRef.current, { filter: "blur(40px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: 1.5, ease: "expo.out" });
      
      if (horizontalRef.current) {
        const totalWidth = horizontalRef.current.scrollWidth;
        const maxScroll = totalWidth - window.innerWidth + 400;

        const updateScroll = (velocity = 0) => {
            const x = - (scrollProgress.current * (totalWidth - window.innerWidth + 200));
            gsap.to(horizontalRef.current, { x, duration: 1.2, ease: "power3.out", overwrite: "auto" });
            
            // Kinetic feedback based on velocity
            const blurAmount = Math.min(Math.abs(velocity) * 0.15, 6);
            const skewAmount = Math.max(Math.min(velocity * 0.02, 10), -10);

            gsap.utils.toArray(".timeline-item").forEach((item) => {
               const details = item.querySelectorAll(".reveal-detail");
               gsap.to(details, { filter: `blur(${blurAmount}px)`, duration: 0.5 });
               gsap.to(item, { skewX: skewAmount, duration: 0.7, ease: "power2.out" });
            });
        };

        Observer.create({
          target: window,
          type: "wheel,touch,pointer",
          onUp: (self) => {
             scrollProgress.current = Math.max(0, scrollProgress.current - 0.06);
             updateScroll(self.deltaY);
          },
          onDown: (self) => {
             scrollProgress.current = Math.min(1, scrollProgress.current + 0.06);
             updateScroll(self.deltaY);
          },
          wheelSpeed: 1,
          tolerance: 10,
          preventDefault: true
        });

        // Initial paint
        updateScroll(0);
      } else {
        gsap.fromTo(".reveal-text", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "expo.out", delay: 0.4 });
        gsap.fromTo(".reveal-p", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out", delay: 1 });
      }
    }, containerRef);
    return () => { ctx.revert(); };
  }, [sectionName, content]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden bg-black/40 backdrop-blur-[60px]">
      <CloseButton onClick={onClose} />
      <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
        {sectionName === 'ABOUT' ? <AboutLayout data={content} /> : 
         sectionName === 'PROJECTS' ? <ProjectLayout data={content} horizontalRef={horizontalRef} titleRef={titleRef} /> : 
         <DefaultLayout sectionName={sectionName} data={content} horizontalRef={horizontalRef} titleRef={titleRef} />}
      </div>
      {sectionName !== 'ABOUT' && (
        <div className="fixed bottom-[40px] left-1/2 -translate-x-1/2 z-[1010] flex flex-col items-center gap-4 opacity-10">
          <span className="text-[0.45rem] tracking-[0.8em] text-white">INTERACT TO REVEAL</span>
          <div className="w-[1px] h-10 bg-white animate-scroll" />
        </div>
      )}
    </div>
  );
};

// --- WebGL Background ---

const SmoothZoom = () => {
    const { camera, gl } = useThree();
    const targetDistance = useRef(36);
    const currentDistance = useRef(36);
    const minZ = 12;
    const maxZ = 60;
  
    useEffect(() => {
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = Math.max(Math.min(e.deltaY, 100), -100) * 0.015;
        targetDistance.current = Math.min(Math.max(targetDistance.current + delta, minZ), maxZ);
      };
      const el = gl.domElement;
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }, [gl]);
  
    useFrame(() => {
      currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, targetDistance.current, 0.04);
      const dir = new THREE.Vector3().copy(camera.position).normalize();
      camera.position.copy(dir.multiplyScalar(currentDistance.current));
    });
    return null;
};

const BreathingLines = ({ lines, hoveredNode, highlightableLineMap }) => {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.elapsedTime;
      const hover = hoveredNode.current;
      groupRef.current.children.forEach((child, index) => {
        if (child && child.material) {
          let targetOpacity;
          const isHighlighted = hover !== null && highlightableLineMap[hover]?.has(index);
          if (isHighlighted) { targetOpacity = 0.45; } 
          else { targetOpacity = 0.04 + Math.abs(Math.sin(t * 1.5 + index * 0.15)) * 0.12; }
          child.material.opacity += (targetOpacity - child.material.opacity) * 0.1;
        }
      });
    }
  });
  return (
    <group ref={groupRef}>
      {lines.map((ln, i) => <Line key={i} points={ln.pts} color="#ffffff" lineWidth={1.2} transparent opacity={0.04} raycast={() => null} />)}
    </group>
  );
};

const NodeDiagram = ({ addLog, onNodeClick }) => {
  const groupRef = useRef();
  const textsRef = useRef([]);
  const hoveredNode = useRef(null);
  
  const nodes = useMemo(() => {
    const pts = [];
    const radius = 18;
    const num = 26;
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < num; i++) {
      const y = 1 - (i / (num - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      pts.push({ label: KEYWORDS[i % KEYWORDS.length], pos: new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius) });
    }
    return pts;
  }, []);

  const lines = useMemo(() => {
    const lns = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        lns.push({ pts: [nodes[i].pos, nodes[j].pos], connectsTo: [i, j] });
      }
    }
    return lns;
  }, [nodes]);

  const highlightableLineMap = useMemo(() => {
    const map = {};
    for (let n = 0; n < nodes.length; n++) {
      map[n] = new Set();
      const dists = nodes.map((v, j) => ({ id: j, d: nodes[n].pos.distanceToSquared(v.pos) })).sort((a,b) => a.d - b.d);
      const cluster = dists.slice(0, 6).map(x => x.id);
      lines.forEach((l, idx) => { if (cluster.includes(l.connectsTo[0]) && cluster.includes(l.connectsTo[1])) map[n].add(idx); });
    }
    return map;
  }, [lines, nodes]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.00015;
    textsRef.current.forEach((txt, i) => {
      if (txt && txt.material) {
        const isHover = hoveredNode.current === i;
        txt.material.color.lerp(new THREE.Color(isHover ? 0xffffff : 0x888888), 0.1);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <group key={i} position={n.pos} onPointerOver={(e) => { e.stopPropagation(); hoveredNode.current = i; addLog(`TARGET: ${n.label}`); }} onPointerOut={() => hoveredNode.current = null} onClick={() => onNodeClick(n.label)}>
          <Billboard>
            <mesh position={[0, 0, -0.05]}><boxGeometry args={[n.label.length * 0.45, 1.2, 0.2]} /><meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} /></mesh>
            <Text ref={el => textsRef.current[i] = el} font="/monospace.ttf" fontSize={0.45} color="#888888" anchorX="center" anchorY="middle" raycast={() => null}>{n.label}</Text>
          </Billboard>
        </group>
      ))}
      <BreathingLines lines={lines} hoveredNode={hoveredNode} highlightableLineMap={highlightableLineMap} />
    </group>
  );
};

// --- Main App ---

function MainApp() {
  const [logs, setLogs] = useState([]);
  const [active, setActive] = useState(null);
  const addLog = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setLogs(p => [{ id, time: new Date().toLocaleTimeString(), message: msg }, ...p].slice(0, 8));
    setTimeout(() => setLogs(p => p.filter(l => l.id !== id)), 4000);
  }, []);

  useEffect(() => { addLog('SYSTEM INITIALIZED'); }, [addLog]);

  const handleHomeReset = useCallback(() => {
    setActive(null);
    addLog('RETURN TO SOURCE');
    // Ensure all ScrollTriggers are killed on home reset
    ScrollTrigger.getAll().forEach(st => st.kill());
  }, [addLog]);

  return (
    <div className={`page-container ${active ? 'is-overlay-open' : ''}`}>
      <TopNav onClick={handleHomeReset} />
      <ActionLog logs={logs} />
      {!active && <CursorCoords />}
      <CursorTrail />
      <div className="scene-wrap"><Canvas camera={{ position: [0, 0, 36], fov: 45 }} dpr={[1, 2]}><color attach="background" args={['#000']} /><fog attach="fog" args={['#000', 30, 80]} /><OrbitControls enableZoom={false} enablePan={false} dampingFactor={0.05} rotateSpeed={0.5} /><Suspense fallback={null}><SmoothZoom /><NodeDiagram addLog={addLog} onNodeClick={(l) => { setActive(l); addLog(`OPENING: ${l}`); }} /></Suspense></Canvas></div>
      {active && <SectionOverlay sectionName={active} onClose={() => setActive(null)} />}
    </div>
  );
}

export default function App() { return <ErrorBoundary><MainApp /></ErrorBoundary>; }
