"use client"

import React, { Suspense, useEffect, useMemo, useRef, useState, createContext, useContext } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Html,
  Plane,
  Sphere,
} from "@react-three/drei"
import { Download, Heart, X, ExternalLink, FolderGit2, Sparkles } from "lucide-react"

/**
 * Single-file Stellar Card Gallery
 * - Context, Starfield, Galaxy, FloatingCard, Modal, and Page in one.
 */

/* =========================
   Card Context & Types
   ========================= */

export type Card = {
  id: string
  imageUrl: string
  alt: string
  title: string
  description?: string
  tag?: string
  skills?: string[]
  githubUrl?: string
  demoUrl?: string
  rawProject?: any
}

type CardContextType = {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  cards: Card[]
  onAction?: (card: Card, actionType: string) => void
}

const CardContext = createContext<CardContextType | undefined>(undefined)

export function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error("useCard must be used within CardProvider")
  return ctx
}

const DEFAULT_UNSPLASH_CARDS: Card[] = [
  { id: "1", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", alt: "Fluid Interface Architecture", title: "Fluid Interface" },
  { id: "2", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80", alt: "Retro Computing Terminal", title: "Retro Mecha Terminal" },
  { id: "3", imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", alt: "Cyber Matrix Stream", title: "Matrix Algorithm Engine" },
  { id: "4", imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80", alt: "Minimalist Web Workspace", title: "Minimalist Workspace" },
  { id: "5", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", alt: "Cloud Data Clusters", title: "Cloud Mesh Infrastructure" },
  { id: "6", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", alt: "Real-time Telemetry Dashboard", title: "Telemetry Analytics" },
  { id: "7", imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80", alt: "Design System Architecture", title: "Design System Core" },
  { id: "8", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", alt: "Microprocessor Logic", title: "Silicon Logic Gateway" },
  { id: "9", imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80", alt: "Neural Network Topology", title: "Neural Sync Engine" },
  { id: "10", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", alt: "Orbital Satellite Link", title: "Stellar Constellation" },
  { id: "11", imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80", alt: "Chromatic Prism Canvas", title: "Prismatic Gradient" },
  { id: "12", imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80", alt: "Quantum Hologram Core", title: "Quantum Node Matrix" },
  { id: "13", imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", alt: "Defensive Cyber Shield", title: "Cyber Shield Protocol" },
  { id: "14", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80", alt: "Game Loop Engine", title: "Interactive Canvas 3D" },
  { id: "15", imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80", alt: "Neon Horizon Grid", title: "Synthwave Vector" },
  { id: "16", imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80", alt: "TypeScript Compiler Core", title: "Compiler Pipeline" },
  { id: "17", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80", alt: "Fullstack Architecture", title: "Fullstack Systems" },
  { id: "18", imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80", alt: "Deep Logic Tree", title: "Algorithmic Solver" },
  { id: "19", imageUrl: "https://images.unsplash.com/photo-1534972195531-a756b11269d5?auto=format&fit=crop&w=600&q=80", alt: "Autonomous Robotics UI", title: "Robotics Mechatronics" },
  { id: "20", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", alt: "Quantum Computation", title: "Quantum Telemetry" },
]

export function CardProvider({
  children,
  initialCards,
  onCardSelect,
  onAction,
}: {
  children: React.ReactNode
  initialCards?: Card[]
  onCardSelect?: (card: Card | null) => void
  onAction?: (card: Card, actionType: string) => void
}) {
  const [selectedCard, setSelectedCardState] = useState<Card | null>(null)
  const cards = initialCards && initialCards.length > 0 ? initialCards : DEFAULT_UNSPLASH_CARDS

  const setSelectedCard = (card: Card | null) => {
    setSelectedCardState(card)
    if (onCardSelect) onCardSelect(card)
  }

  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard, cards, onAction }}>
      {children}
    </CardContext.Provider>
  )
}

/* =========================
   Starfield Background
   ========================= */

export function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 8000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.75, sizeAttenuation: true, transparent: true, opacity: 0.7 })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    camera.position.z = 10

    let animationId = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.00015
      stars.rotation.x += 0.00008
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      starsGeometry.dispose()
      starsMaterial.dispose()
    }
  }, [])

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />
}

/* =========================
   Floating Card
   ========================= */

export function FloatingCard({
  card,
  position,
}: {
  card: Card
  position: { x: number; y: number; z: number; rotationX: number; rotationY: number; rotationZ: number }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedCard } = useCard()

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    setSelectedCard(card)
  }
  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = "auto"
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane
        ref={meshRef}
        args={[4.5, 6]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-44 h-56 rounded-xl overflow-hidden shadow-2xl bg-[#0f172a]/95 border border-cyan-500/30 p-3 select-none flex flex-col justify-between backdrop-blur-md"
          style={{
            boxShadow: hovered
              ? "0 20px 40px rgba(34, 211, 238, 0.45), 0 0 30px rgba(34, 211, 238, 0.25)"
              : "0 10px 25px rgba(0, 0, 0, 0.7)",
            borderColor: hovered ? "rgba(34, 211, 238, 0.8)" : "rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="w-full h-36 rounded-lg overflow-hidden relative bg-slate-900">
            <img
              src={card.imageUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"}
              alt={card.alt || card.title}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
              }}
            />
            {card.tag && (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                {card.tag}
              </span>
            )}
          </div>
          <div className="mt-1 text-center">
            <p className="text-white text-xs font-semibold truncate font-['Outfit'] tracking-wide">{card.title}</p>
            {card.skills && card.skills.length > 0 && (
              <p className="text-[10px] font-mono text-cyan-400/80 truncate mt-0.5">
                {card.skills.slice(0, 2).join(" • ")}
              </p>
            )}
          </div>
        </div>
      </Html>
    </group>
  )
}

/* =========================
   Card Modal
   ========================= */

export function CardModal() {
  const { selectedCard, setSelectedCard, onAction } = useCard()
  const [isFavorited, setIsFavorited] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (!selectedCard) return null

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {}
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const toggleFavorite = () => {
    setIsFavorited((v) => !v)
    if (onAction) onAction(selectedCard, "favorite")
  }

  const handleClose = () => setSelectedCard(null)
  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={handleBackdropClick}>
      <div className="relative max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10 p-1 rounded-full bg-white/10 hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-2xl bg-[#0f172a] border border-cyan-500/30 p-5 transition-all duration-300 ease-out w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            style={{
              transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full mb-4 rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: "4 / 3" }}>
              <img
                loading="lazy"
                className="absolute inset-0 h-full w-full bg-black object-cover"
                alt={selectedCard.alt || selectedCard.title}
                src={selectedCard.imageUrl}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
                }}
              />
              {selectedCard.tag && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {selectedCard.tag}
                </div>
              )}
            </div>

            <h3 className="text-white text-xl font-bold mb-2 text-center font-['Outfit']">{selectedCard.title}</h3>

            {selectedCard.description && (
              <p className="text-slate-300 text-xs leading-relaxed mb-4 text-center">
                {selectedCard.description}
              </p>
            )}

            {selectedCard.skills && selectedCard.skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                {selectedCard.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {selectedCard.demoUrl ? (
                <a
                  href={selectedCard.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-slate-950 outline-none transition duration-200 ease-out hover:opacity-90 active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                  style={{ backgroundColor: "#22d3ee" }}
                >
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-4 w-4" strokeWidth={2} />
                    <span>Launch Project</span>
                  </div>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onAction && onAction(selectedCard, "download")}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-slate-950 outline-none transition duration-200 ease-out hover:opacity-90 active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                  style={{ backgroundColor: "#22d3ee" }}
                >
                  <div className="flex items-center gap-1.5">
                    <Download className="h-4 w-4" strokeWidth={2} />
                    <span>Inspect System</span>
                  </div>
                </button>
              )}

              {selectedCard.githubUrl && (
                <a
                  href={selectedCard.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/10 transition duration-200 active:scale-[0.98]"
                  title="View Repository"
                >
                  <FolderGit2 className="h-4 w-4" />
                </a>
              )}

              <button
                type="button"
                onClick={toggleFavorite}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-950 outline-none transition duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "#22d3ee" }}
              >
                <Heart className="h-4 w-4" strokeWidth={2} fill={isFavorited ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Card Galaxy
   ========================= */

export function CardGalaxy() {
  const { cards } = useCard()

  const cardPositions = useMemo(() => {
    const positions: {
      x: number
      y: number
      z: number
      rotationX: number
      rotationY: number
      rotationZ: number
    }[] = []
    const numCards = Math.max(cards.length, 1)
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numCards; i++) {
      const y = numCards === 1 ? 0 : 1 - (i / (numCards - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const layerRadius = 12 + (i % 3) * 4

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2,
      })
    }
    return positions
  }, [cards])

  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0e7490" transparent opacity={0.2} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#67e8f9" transparent opacity={0.02} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id || i} card={card} position={cardPositions[i] || cardPositions[0]} />
      ))}
    </>
  )
}

/* =========================
   Page/Component Export
   ========================= */

export interface StellarCardGalleryProps {
  cards?: Card[]
  onCardSelect?: (card: Card | null) => void
  onAction?: (card: Card, actionType: string) => void
  title?: string
  subtitle?: string
  hideHeader?: boolean
  className?: string
}

export default function StellarCardGallerySingle({
  cards,
  onCardSelect,
  onAction,
  title = "3D Stellar Card Gallery",
  subtitle = "Drag to look around • Scroll to zoom • Click cards to view details",
  hideHeader = false,
  className = "",
}: StellarCardGalleryProps) {
  return (
    <CardProvider initialCards={cards} onCardSelect={onCardSelect} onAction={onAction}>
      <div className={`w-full h-full min-h-[500px] relative overflow-hidden bg-transparent rounded-2xl ${className}`}>
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          className="absolute inset-0 z-10 w-full h-full"
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = "auto"
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#67e8f9" />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#38bdf8" />
            <CardGalaxy />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={40}
              autoRotate={true}
              autoRotateSpeed={0.5}
              rotateSpeed={0.6}
              zoomSpeed={1.2}
              panSpeed={0.8}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <CardModal />

        {!hideHeader && (
          <div className="absolute top-4 left-4 z-20 text-white pointer-events-none backdrop-blur-md bg-slate-950/40 p-3.5 rounded-xl border border-white/10">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              {title}
            </h1>
            <p className="text-xs text-slate-300 opacity-80 mt-0.5">{subtitle}</p>
          </div>
        )}
      </div>
    </CardProvider>
  )
}
