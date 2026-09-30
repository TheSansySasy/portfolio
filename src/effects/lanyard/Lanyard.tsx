/**
 * Adapted from React Bits "Lanyard" by David Haz.
 * Source: https://reactbits.dev/components/lanyard
 * Licence: MIT + Commons Clause, see ../LICENSE-react-bits.md. Vendored 2026-09-30,
 * with the card model (card.glb) from the same component.
 *
 * Local changes:
 * - Physics is a small Verlet rope (ropePhysics.ts) instead of the Rapier
 *   engine, whose WASM made the chunk about 1.1 MB compressed. Same topology:
 *   a fixed anchor, three rope segments, the card hung 1.45 below the last.
 * - A click turns the card over, and it rests on either face, so the QR code
 *   on the back can be scanned. The original always swung back to the front.
 * - The badge faces, holographic foil and strap print are drawn at runtime from
 *   the theme tokens (badgeArt.ts), so both themes match the site and no images
 *   ship. The model's embedded 2.3 MB texture was stripped (2.4 MB to 139 KB).
 * - No drei: the model loads through three's GLTFLoader, and the lighting is a
 *   PMREM of the original's four light strips.
 * - Scaled to hang inside the About column: shorter rope segments, and a camera
 *   that makes the card the size of the static badge.
 * - Renders on demand. The original ran its render loop forever and woke the
 *   card on every frame, so it never came to rest; here frames run only while
 *   something moves or the card is held, and never while the canvas is off
 *   screen.
 * - Scratch vectors are allocated once rather than on every render, the band's
 *   smoothing is clamped so a long pause cannot overshoot, and the cursor is
 *   restored on unmount.
 * - Decorative and aria-hidden: the static badge stays in the DOM for
 *   assistive tech.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useLoader, useThree, type ThreeElement, type ThreeEvent } from '@react-three/fiber'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import type { ThemeTokens } from '../../lib/useThemeTokens'
import { paintCardAtlas, paintStrap, paintSurfaceAtlas, STRAP_H, STRAP_W } from './badgeArt'
import cardUrl from './card.glb?url'
import { cardQuaternion, clampTarget, createRope, flipCard, stepRope, type Rope } from './ropePhysics'

extend({ MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>
  }
}

// Scene scale. The canvas is 48rem tall; at this distance the view is 4.4
// units high, so the card (1.6 units wide) draws about 280px across.
const CAMERA_Z = 12.4
const FOV = 20
const ANCHOR = new THREE.Vector3(0, 2.45, 0) // just above the top edge, so the strap enters from outside
const STRAP_WIDTH = 0.55 // world units, about a third of the card
// MeshLine offsets its edges in clip space, so a world width has to be divided
// by the view's half-height per unit of distance to come out the right size.
const STRAP_LINE_WIDTH = STRAP_WIDTH / Math.tan(THREE.MathUtils.degToRad(FOV / 2))
// MeshLine stretches the texture over the whole band, so the repeat is the
// band's rough length over one print's undistorted length. Negative runs the
// print downwards from the top of the strap.
const STRAP_REPEAT = -2.3 / (STRAP_WIDTH * (STRAP_W / STRAP_H))
// MeshLineMaterial's constructor requires a resolution; props set the rest.
const STRAP_MATERIAL = { resolution: new THREE.Vector2(1000, 1000) }

type CardNodes = { card: THREE.Mesh; clip: THREE.Mesh; clamp: THREE.Mesh }

function useStudioLighting() {
  const gl = useThree((state) => state.gl)
  const get = useThree((state) => state.get)

  useEffect(() => {
    // The original's four Lightformers, as emissive strips around a dim room,
    // prefiltered once. Grey rather than black so the metal foil never reads
    // as a hole in the card.
    const room = new THREE.Scene()
    room.background = new THREE.Color(0.25, 0.25, 0.27)
    const geometry = new THREE.PlaneGeometry(1, 1)
    const strips: [number, [number, number, number], [number, number, number], [number, number, number]][] = [
      [2, [0, -1, 5], [0, 0, Math.PI / 3], [100, 0.1, 1]],
      [3, [-1, -1, 1], [0, 0, Math.PI / 3], [100, 0.1, 1]],
      [3, [1, 1, 1], [0, 0, Math.PI / 3], [100, 0.1, 1]],
      // The original's fourth light, a large panel at intensity 10, runs almost
      // straight behind the camera; its reflection greyed the whole face of a
      // dark card. A soft light above does its job without facing the lens.
      [2, [0, 8, 4], [Math.PI / 2, 0, 0], [30, 6, 1]],
    ]
    const materials = strips.map(([intensity, position, rotation, scale]) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 1).multiplyScalar(intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      mesh.scale.set(...scale)
      room.add(mesh)
      return material
    })

    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromScene(room, 0.02)
    const { scene } = get()
    scene.environment = target.texture

    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      geometry.dispose()
      materials.forEach((material) => material.dispose())
    }
  }, [gl, get])
}

function useBadgeTextures(tokens: ThemeTokens, url: string) {
  const gl = useThree((state) => state.gl)

  const textures = useMemo(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())

    const card = new THREE.CanvasTexture(paintCardAtlas(tokens, url))
    card.colorSpace = THREE.SRGBColorSpace
    card.flipY = false // glTF UV convention
    card.anisotropy = anisotropy

    const surface = new THREE.CanvasTexture(paintSurfaceAtlas())
    surface.colorSpace = THREE.NoColorSpace
    surface.flipY = false

    const strap = new THREE.CanvasTexture(paintStrap(tokens))
    strap.colorSpace = THREE.SRGBColorSpace
    strap.wrapS = THREE.RepeatWrapping
    strap.wrapT = THREE.RepeatWrapping
    strap.anisotropy = anisotropy

    return { card, surface, strap }
  }, [gl, tokens, url])

  useEffect(
    () => () => {
      textures.card.dispose()
      textures.surface.dispose()
      textures.strap.dispose()
    },
    [textures],
  )

  return textures
}

function Band({
  tokens,
  url,
  visible,
  onReady,
}: {
  tokens: ThemeTokens
  url: string
  visible: boolean
  onReady: () => void
}) {
  const band = useRef<THREE.Mesh<MeshLineGeometry, MeshLineMaterial>>(null)
  const cardBody = useRef<THREE.Group>(null)
  // The simulation is mutable state stepped every frame, so it lives in a ref.
  // Created on first use, from callbacks only.
  const ropeRef = useRef<Rope>(null)
  const getRope = () => (ropeRef.current ??= createRope(ANCHOR))
  const [scratch] = useState(() => ({
    ray: new THREE.Vector3(),
    target: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    lerped: createRope(ANCHOR).pos.slice(1, 3),
    curve: Object.assign(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      { curveType: 'chordal' as const },
    ),
  }))
  // Grab offset from the card's centre while it is held, in world units.
  const [held, hold] = useState<THREE.Vector3 | null>(null)
  const [hovered, hover] = useState(false)
  const holdPlane = useRef(0)
  const pressedAt = useRef({ x: 0, y: 0, time: 0 })
  const invalidate = useThree((state) => state.invalidate)

  const gltf = useLoader(GLTFLoader, cardUrl) as GLTF
  const nodes = useMemo(() => {
    const find = (name: keyof CardNodes) => gltf.scene.getObjectByName(name) as THREE.Mesh
    return { card: find('card'), clip: find('clip'), clamp: find('clamp') }
  }, [gltf])
  const metal = nodes.clip.material as THREE.MeshStandardMaterial
  const textures = useBadgeTextures(tokens, url)

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = held ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered, held])

  // Wake the loop when the canvas scrolls back into view or the theme changes.
  useEffect(() => {
    if (ropeRef.current) ropeRef.current.restFrames = 0
    if (visible) invalidate()
  }, [visible, tokens, invalidate])

  useEffect(() => {
    // First frame with the model and textures in place: safe to swap out the
    // static badge.
    const frame = requestAnimationFrame(onReady)
    return () => cancelAnimationFrame(frame)
  }, [onReady])

  useFrame((state, delta) => {
    if (!band.current || !cardBody.current) return
    const rope = getRope()
    const { ray, target, quaternion, lerped, curve } = scratch
    const dt = Math.min(delta, 1 / 30)

    rope.wallX = state.viewport.width / 2 - 0.95
    let pin: THREE.Vector3 | null = null
    if (held) {
      // Where the pointer ray meets the plane the card was grabbed in.
      ray.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera).sub(state.camera.position).normalize()
      const distance = (holdPlane.current - state.camera.position.z) / ray.z
      target.copy(state.camera.position).addScaledVector(ray, distance).sub(held)
      clampTarget(rope, target, state.viewport.width / 2, state.viewport.height / 2)
      pin = target
    }
    const moving = stepRope(rope, dt, pin)

    cardBody.current.position.copy(rope.pos[4])
    cardBody.current.quaternion.copy(cardQuaternion(rope, quaternion))

    // The band trails the middle joints slightly, as in the original.
    for (let i = 0; i < 2; i++) {
      const joint = rope.pos[i + 1]
      const lag = Math.max(0.1, Math.min(1, lerped[i].distanceTo(joint)))
      lerped[i].lerp(joint, Math.min(1, dt * lag * 50))
    }
    curve.points[0].copy(rope.pos[3])
    curve.points[1].copy(lerped[1])
    curve.points[2].copy(lerped[0])
    curve.points[3].copy(rope.pos[0])
    band.current.geometry.setPoints(curve.getPoints(32))

    if (visible && moving) invalidate()
  })

  return (
    <>
      <group ref={cardBody}>
        <group
          scale={2.25}
          position={[0, -1.2, -0.05]}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerUp={(event: ThreeEvent<PointerEvent>) => {
            // The card is double-sided, so a ray hits both faces and handlers
            // run once per hit; without this a click flipped the card twice.
            event.stopPropagation()
            ;(event.target as Element).releasePointerCapture(event.pointerId)
            hold(null)
            // A press that barely moved is a click: turn the card over.
            const press = pressedAt.current
            const travel = Math.hypot(event.nativeEvent.clientX - press.x, event.nativeEvent.clientY - press.y)
            if (travel < 6 && event.nativeEvent.timeStamp - press.time < 400) flipCard(getRope())
            invalidate()
          }}
          onPointerDown={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation()
            ;(event.target as Element).setPointerCapture(event.pointerId)
            pressedAt.current = {
              x: event.nativeEvent.clientX,
              y: event.nativeEvent.clientY,
              time: event.nativeEvent.timeStamp,
            }
            const card = getRope().pos[4]
            holdPlane.current = card.z
            hold(event.point.clone().sub(card))
            invalidate()
          }}
        >
          <mesh geometry={nodes.card.geometry}>
            <meshPhysicalMaterial
              map={textures.card}
              roughnessMap={textures.surface}
              metalnessMap={textures.surface}
              iridescenceMap={textures.surface}
              roughness={1}
              metalness={1}
              iridescence={1}
              iridescenceIOR={1.35}
              iridescenceThicknessRange={[180, 520]}
              clearcoat={0.35}
              clearcoatRoughness={0.25}
            />
          </mesh>
          <mesh geometry={nodes.clip.geometry} material={metal} material-roughness={0.3} />
          <mesh geometry={nodes.clamp.geometry} material={metal} />
        </group>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[STRAP_MATERIAL]}
          color="white"
          depthTest={false}
          resolution={[1000, 1000]}
          useMap={1}
          map={textures.strap}
          repeat={[STRAP_REPEAT, 1]}
          lineWidth={STRAP_LINE_WIDTH}
        />
      </mesh>
    </>
  )
}

function Scene(props: { tokens: ThemeTokens; url: string; visible: boolean; onReady: () => void }) {
  useStudioLighting()
  return <Band {...props} />
}

export default function Lanyard(props: {
  tokens: ThemeTokens
  url: string
  visible: boolean
  onReady: () => void
}) {
  return (
    <Canvas
      aria-hidden="true"
      frameloop="demand"
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      {/* Below pi because the grey room already lights the card a quarter. */}
      <ambientLight intensity={Math.PI * 0.75} />
      <Scene {...props} />
    </Canvas>
  )
}
