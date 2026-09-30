/**
 * The lanyard's physics: a Verlet rope of three segments from a fixed anchor,
 * with the card's centre hung rigidly below the last joint. Replaces the Rapier
 * engine the React Bits original used, whose WASM build was about 1 MB of the
 * chunk after compression, for a problem this small.
 *
 * The rope is inextensible but slack (a segment only pulls when stretched), and
 * the card is four times heavier than a rope joint. Positions are in world
 * units; the card's centre is particle 4.
 *
 * The card's turn about its own vertical axis has two resting faces, front
 * and back, so a flipped card stays flipped long enough to scan its QR code.
 * Sideways motion kicks it; while it spins fast it turns freely, and once it
 * slows it settles on whichever face is nearer. `flipCard` turns it to the
 * other face on purpose, for a click.
 */
import * as THREE from 'three'

export const SEGMENT = 0.58
export const CARD_ARM = 1.45 // joint to card centre, as in the original's spherical joint

const GRAVITY = -40
const LINEAR_DAMPING = 4
const SUBSTEPS = 4
const ITERATIONS = 8
const TWIST_SPRING = 4
const FLIP_SPRING = 12 // stiffer while a click is turning the card over
const TWIST_DAMPING = 3.2
const TWIST_KICK = 6
const FREE_SPIN = 3 // radians per second; faster than this, no face pulls
const REST_SPEED = 0.0004
const REST_FRAMES = 30
const MAX_FLING = 7 // units per second, so a hard throw cannot leave the view

export type Rope = {
  anchor: THREE.Vector3
  pos: THREE.Vector3[]
  prev: THREE.Vector3[]
  twist: number
  twistSpeed: number
  /** The face the card settles on: 0 front, 1 back. */
  face: 0 | 1
  /** True while a click is turning the card to `face`. */
  flipping: boolean
  restFrames: number
  /** Where the held card was last frame, to spread each move across substeps. */
  heldFrom: THREE.Vector3 | null
  /** How far either side of centre the card's centre may go; 0 for no walls. */
  wallX: number
}

export function createRope(anchor: THREE.Vector3): Rope {
  // Start with the rope held out to the right, so the card swings in.
  const pos = [
    anchor.clone(),
    anchor.clone().add(new THREE.Vector3(0.45, 0, 0)),
    anchor.clone().add(new THREE.Vector3(0.9, 0, 0)),
    anchor.clone().add(new THREE.Vector3(1.35, 0, 0)),
    anchor.clone().add(new THREE.Vector3(1.35, -CARD_ARM, 0)),
  ]
  return {
    anchor: anchor.clone(),
    pos,
    prev: pos.map((p) => p.clone()),
    twist: 0,
    twistSpeed: 0,
    face: 0,
    flipping: false,
    restFrames: 0,
    heldFrom: null,
    wallX: 0,
  }
}

const scratch = new THREE.Vector3()
// Inverse masses: the anchor never moves, and the card outweighs a joint.
const INVERSE_MASS = [0, 1, 1, 1, 0.25]

function solve(a: THREE.Vector3, b: THREE.Vector3, wa: number, wb: number, length: number, slack: boolean) {
  scratch.subVectors(b, a)
  const distance = scratch.length()
  if (distance === 0 || (slack && distance <= length)) return
  const total = wa + wb
  if (total === 0) return
  const correction = (distance - length) / distance / total
  a.addScaledVector(scratch, correction * wa)
  b.addScaledVector(scratch, -correction * wb)
}

/**
 * Clamps a drag target to where the card can reach on its rope and still be
 * whole inside the view (half extents in world units, centred on the origin).
 */
export function clampTarget(rope: Rope, target: THREE.Vector3, halfWidth: number, halfHeight: number) {
  const reach = SEGMENT * 3 + CARD_ARM
  scratch.subVectors(target, rope.anchor)
  if (scratch.length() > reach) target.copy(rope.anchor).addScaledVector(scratch.normalize(), reach)
  target.x = THREE.MathUtils.clamp(target.x, -halfWidth + 0.95, halfWidth - 0.95)
  target.y = THREE.MathUtils.clamp(target.y, -halfHeight + 1.2, halfHeight - 1.2)
}

const held = new THREE.Vector3()

/** The angle in (-pi, pi], so every spring turns the short way. */
const wrap = (angle: number) => THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI

/** Turns the card over to its other face, as a click asks. */
export function flipCard(rope: Rope) {
  rope.face = rope.face === 0 ? 1 : 0
  rope.flipping = true
  rope.restFrames = 0
}

/**
 * Advances the rope by `dt` seconds. With a `target`, the card's centre is
 * held and moved there; letting go keeps its velocity, so a drag can fling it.
 * Returns true while anything is still moving.
 */
export function stepRope(rope: Rope, dt: number, target: THREE.Vector3 | null): boolean {
  const h = dt / SUBSTEPS
  const damping = 1 / (1 + LINEAR_DAMPING * h)
  const { pos, prev } = rope
  let fastest = 0
  let sideways = 0

  if (!target && rope.heldFrom) {
    // Just let go: keep the card's velocity, within reason.
    rope.heldFrom = null
    scratch.subVectors(pos[4], prev[4])
    const limit = MAX_FLING * h
    if (scratch.length() > limit) prev[4].copy(pos[4]).addScaledVector(scratch.normalize(), -limit)
  }
  const from = target ? (rope.heldFrom ??= pos[4].clone()) : null

  for (let sub = 0; sub < SUBSTEPS; sub++) {
    // The held card moves a share of this frame's drag on every substep, so
    // its velocity is real and survives the release.
    if (target && from) held.lerpVectors(from, target, (sub + 1) / SUBSTEPS)
    for (let i = 1; i < pos.length; i++) {
      if (i === 4 && target) {
        prev[4].copy(pos[4])
        pos[4].copy(held)
        continue
      }
      scratch.subVectors(pos[i], prev[i]).multiplyScalar(damping)
      prev[i].copy(pos[i])
      pos[i].add(scratch)
      pos[i].y += GRAVITY * h * h
    }

    for (let iteration = 0; iteration < ITERATIONS; iteration++) {
      pos[0].copy(rope.anchor)
      for (let i = 1; i <= 3; i++) {
        solve(pos[i - 1], pos[i], INVERSE_MASS[i - 1], INVERSE_MASS[i], SEGMENT, true)
      }
      solve(pos[3], pos[4], INVERSE_MASS[3], target ? 0 : INVERSE_MASS[4], CARD_ARM, false)
      if (target) pos[4].copy(held)
    }

    // Soft walls at the edges of the view: a thrown card bounces back, losing
    // most of its speed, instead of swinging out of the canvas.
    const overshoot = rope.wallX > 0 ? Math.abs(pos[4].x) - rope.wallX : 0
    if (!target && overshoot > 0) {
      const edge = Math.sign(pos[4].x) * rope.wallX
      const speed = pos[4].x - prev[4].x
      pos[4].x = edge
      prev[4].x = edge + speed * 0.3
    }

    const cardVelocityX = (pos[4].x - prev[4].x) / h
    sideways = cardVelocityX
    const spinningFree = !rope.flipping && Math.abs(rope.twistSpeed) > FREE_SPIN
    if (!rope.flipping && !spinningFree) rope.face = Math.abs(rope.twist) <= Math.PI / 2 ? 0 : 1
    const offset = wrap(rope.twist - rope.face * Math.PI)
    const spring = spinningFree ? 0 : rope.flipping ? FLIP_SPRING : TWIST_SPRING
    rope.twistSpeed += (-spring * offset - cardVelocityX * TWIST_KICK) * h
    rope.twistSpeed *= 1 / (1 + TWIST_DAMPING * h)
    rope.twist = wrap(rope.twist + rope.twistSpeed * h)
    if (rope.flipping && Math.abs(offset) < 0.3 && Math.abs(rope.twistSpeed) < FREE_SPIN) rope.flipping = false
  }

  if (target) rope.heldFrom?.copy(target)

  for (let i = 1; i < pos.length; i++) fastest = Math.max(fastest, pos[i].distanceTo(prev[i]))
  const moving =
    !!target ||
    fastest > REST_SPEED ||
    rope.flipping ||
    Math.abs(rope.twistSpeed) > 0.004 ||
    Math.abs(wrap(rope.twist - rope.face * Math.PI)) > 0.004 ||
    Math.abs(sideways) > 0.01
  rope.restFrames = moving ? 0 : rope.restFrames + 1
  return rope.restFrames < REST_FRAMES
}

const up = new THREE.Vector3()
const Y = new THREE.Vector3(0, 1, 0)
const turn = new THREE.Quaternion()

/** The card's orientation: hanging along the last joint, turned by the twist. */
export function cardQuaternion(rope: Rope, out: THREE.Quaternion): THREE.Quaternion {
  up.subVectors(rope.pos[3], rope.pos[4]).normalize()
  out.setFromUnitVectors(Y, up)
  turn.setFromAxisAngle(Y, rope.twist)
  return out.multiply(turn)
}
