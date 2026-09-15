/**
 * Adapted from React Bits "Infinite Menu" by David Haz.
 * Source: https://reactbits.dev/components/infinite-menu
 * Licence: MIT + Commons Clause, see ./LICENSE-react-bits.md. Vendored 2026-09-15.
 *
 * The geometry, arcball control and instanced disc shader stay close to the
 * original. Local changes:
 * - Tiles are typographic, drawn onto a canvas atlas in the active theme's
 *   colours instead of remote photos. A theme change rebuilds the atlas without
 *   recreating the WebGL context.
 * - The original never cancelled its animation frame or removed its listeners,
 *   so every re-render stacked another render loop. The engine now has start,
 *   stop and destroy, pauses off screen, stops drawing once the sphere has
 *   settled, and resizes from a ResizeObserver.
 * - Cells of up to 384px instead of a fixed 512px, capped so the atlas never
 *   exceeds the GPU's maximum texture size (WebGL 2 only guarantees 2048px, and
 *   an oversized atlas fails silently). Under half the memory of the original,
 *   still sharp at the size the front tile is drawn.
 * - The fragment shader premultiplies alpha, so fading discs composite
 *   correctly over the light theme and not only over black.
 * - Starts from a transparent 1x1 texture instead of sampling an empty one.
 * - Overlay restyled to the site's type, the external-link button removed, and
 *   canvas plus overlay hidden from assistive tech, because the full stack list
 *   is rendered beside it.
 * - Parameter properties rewritten as fields (erasableSyntaxOnly), unused
 *   uniforms dropped, and a missing WebGL 2 context reported to the caller.
 */
import { useEffect, useRef, useState } from 'react'
import { mat4, quat, vec2, vec3 } from 'gl-matrix'
import { useThemeTokens, type ThemeTokens } from '../lib/useThemeTokens'

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);

    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;

    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
    // Premultiply, so the canvas composites correctly over any page colour.
    outColor.rgb *= outColor.a;
}
`

class Face {
  public a: number
  public b: number
  public c: number

  constructor(a: number, b: number, c: number) {
    this.a = a
    this.b = b
    this.c = c
  }
}

class Vertex {
  public position: vec3
  public normal: vec3
  public uv: vec2

  constructor(x: number, y: number, z: number) {
    this.position = vec3.fromValues(x, y, z)
    this.normal = vec3.create()
    this.uv = vec2.create()
  }
}

class Geometry {
  public vertices: Vertex[] = []
  public faces: Face[] = []

  public addVertex(...args: number[]): this {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]))
    }
    return this
  }

  public addFace(...args: number[]): this {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]))
    }
    return this
  }

  public get lastVertex(): Vertex {
    return this.vertices[this.vertices.length - 1]
  }

  public subdivide(divisions = 1): this {
    const midPointCache: Record<string, number> = {}
    let f = this.faces

    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array<Face>(f.length * 4)

      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache)
        const mBC = this.getMidPoint(face.b, face.c, midPointCache)
        const mCA = this.getMidPoint(face.c, face.a, midPointCache)

        const i = ndx * 4
        newFaces[i + 0] = new Face(face.a, mAB, mCA)
        newFaces[i + 1] = new Face(face.b, mBC, mAB)
        newFaces[i + 2] = new Face(face.c, mCA, mBC)
        newFaces[i + 3] = new Face(mAB, mBC, mCA)
      })

      f = newFaces
    }

    this.faces = f
    return this
  }

  public spherize(radius = 1): this {
    this.vertices.forEach((vertex) => {
      vec3.normalize(vertex.normal, vertex.position)
      vec3.scale(vertex.position, vertex.normal, radius)
    })
    return this
  }

  public get data(): {
    vertices: Float32Array
    indices: Uint16Array
    normals: Float32Array
    uvs: Float32Array
  } {
    return {
      vertices: new Float32Array(this.vertices.flatMap((v) => Array.from(v.position))),
      indices: new Uint16Array(this.faces.flatMap((f) => [f.a, f.b, f.c])),
      normals: new Float32Array(this.vertices.flatMap((v) => Array.from(v.normal))),
      uvs: new Float32Array(this.vertices.flatMap((v) => Array.from(v.uv))),
    }
  }

  public getMidPoint(ndxA: number, ndxB: number, cache: Record<string, number>): number {
    const cacheKey = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
      return cache[cacheKey]
    }
    const a = this.vertices[ndxA].position
    const b = this.vertices[ndxB].position
    const ndx = this.vertices.length
    cache[cacheKey] = ndx
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5)
    return ndx
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super()
    const t = Math.sqrt(5) * 0.5 + 0.5
    // prettier-ignore
    this.addVertex(
      -1, t, 0,   1, t, 0,   -1, -t, 0,   1, -t, 0,
      0, -1, t,   0, 1, t,   0, -1, -t,   0, 1, -t,
      t, 0, -1,   t, 0, 1,   -t, 0, -1,   -t, 0, 1,
    ).addFace(
      0, 11, 5,   0, 5, 1,   0, 1, 7,   0, 7, 10,   0, 10, 11,
      1, 5, 9,    5, 11, 4,  11, 10, 2, 10, 7, 6,   7, 1, 8,
      3, 9, 4,    3, 4, 2,   3, 2, 6,   3, 6, 8,    3, 8, 9,
      4, 9, 5,    2, 4, 11,  6, 2, 10,  8, 6, 7,    9, 8, 1,
    )
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super()
    const safeSteps = Math.max(4, steps)
    const alpha = (2 * Math.PI) / safeSteps

    this.addVertex(0, 0, 0)
    this.lastVertex.uv[0] = 0.5
    this.lastVertex.uv[1] = 0.5

    for (let i = 0; i < safeSteps; ++i) {
      const x = Math.cos(alpha * i)
      const y = Math.sin(alpha * i)
      this.addVertex(radius * x, radius * y, 0)
      this.lastVertex.uv[0] = x * 0.5 + 0.5
      this.lastVertex.uv[1] = y * 0.5 + 0.5

      if (i > 0) {
        this.addFace(0, i, i + 1)
      }
    }
    this.addFace(0, safeSteps, 1)
  }
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
  return null
}

function createProgram(
  gl: WebGL2RenderingContext,
  shaderSources: [string, string],
  attribLocations: Record<string, number>,
): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null

  ;[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx])
    if (shader) gl.attachShader(program, shader)
  })

  for (const attrib of Object.keys(attribLocations)) {
    gl.bindAttribLocation(program, attribLocations[attrib], attrib)
  }

  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program
  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
  return null
}

function makeVertexArray(
  gl: WebGL2RenderingContext,
  bufLocNumElmPairs: Array<[WebGLBuffer, number, number]>,
  indices?: Uint16Array,
): WebGLVertexArrayObject | null {
  const va = gl.createVertexArray()
  if (!va) return null

  gl.bindVertexArray(va)
  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1) continue
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0)
  }
  if (indices) {
    const indexBuffer = gl.createBuffer()
    if (indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    }
  }
  gl.bindVertexArray(null)
  return va
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const displayWidth = Math.round(canvas.clientWidth * dpr)
  const displayHeight = Math.round(canvas.clientHeight * dpr)
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight
  if (needResize) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
  return needResize
}

function makeBuffer(gl: WebGL2RenderingContext, data: ArrayBufferView, usage: number): WebGLBuffer {
  const buf = gl.createBuffer()
  if (!buf) throw new Error('Failed to create WebGL buffer.')
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, data, usage)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return buf
}

type UpdateCallback = (deltaTime: number) => void

class ArcballControl {
  private readonly canvas: HTMLCanvasElement
  private readonly updateCallback: UpdateCallback

  public isPointerDown = false
  public orientation = quat.create()
  public pointerRotation = quat.create()
  public rotationVelocity = 0
  public rotationAxis = vec3.fromValues(1, 0, 0)

  public snapDirection = vec3.fromValues(0, 0, -1)
  public snapTargetDirection: vec3 | null = null

  private pointerPos = vec2.create()
  private previousPointerPos = vec2.create()
  private smoothedVelocity = 0
  private combinedQuat = quat.create()

  private readonly EPSILON = 0.1
  private readonly IDENTITY_QUAT = quat.create()

  private readonly onPointerDown = (e: PointerEvent) => {
    vec2.set(this.pointerPos, e.clientX, e.clientY)
    vec2.copy(this.previousPointerPos, this.pointerPos)
    this.isPointerDown = true
  }
  private readonly onPointerUp = () => {
    this.isPointerDown = false
  }
  private readonly onPointerMove = (e: PointerEvent) => {
    if (this.isPointerDown) vec2.set(this.pointerPos, e.clientX, e.clientY)
  }

  constructor(canvas: HTMLCanvasElement, updateCallback: UpdateCallback) {
    this.canvas = canvas
    this.updateCallback = updateCallback
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointerleave', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.style.touchAction = 'none'
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointerleave', this.onPointerUp)
    this.canvas.removeEventListener('pointercancel', this.onPointerUp)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
  }

  public update(deltaTime: number, targetFrameDuration = 16): void {
    const timeScale = deltaTime / targetFrameDuration + 0.00001
    let angleFactor = timeScale
    const snapRotation = quat.create()

    if (this.isPointerDown) {
      const INTENSITY = 0.3 * timeScale
      const ANGLE_AMPLIFICATION = 5 / timeScale
      const midPointerPos = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos)
      vec2.scale(midPointerPos, midPointerPos, INTENSITY)

      if (vec2.sqrLen(midPointerPos) > this.EPSILON) {
        vec2.add(midPointerPos, this.previousPointerPos, midPointerPos)

        const p = this.project(midPointerPos)
        const q = this.project(this.previousPointerPos)
        const a = vec3.normalize(vec3.create(), p)
        const b = vec3.normalize(vec3.create(), q)

        vec2.copy(this.previousPointerPos, midPointerPos)
        angleFactor *= ANGLE_AMPLIFICATION
        this.quatFromVectors(a, b, this.pointerRotation, angleFactor)
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY)
      }
    } else {
      const INTENSITY = 0.1 * timeScale
      quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY)

      if (this.snapTargetDirection) {
        const SNAPPING_INTENSITY = 0.2
        const a = this.snapTargetDirection
        const b = this.snapDirection
        const sqrDist = vec3.squaredDistance(a, b)
        const distanceFactor = Math.max(0.1, 1 - sqrDist * 10)
        angleFactor *= SNAPPING_INTENSITY * distanceFactor
        this.quatFromVectors(a, b, snapRotation, angleFactor)
      }
    }

    const combinedQuat = quat.multiply(quat.create(), snapRotation, this.pointerRotation)
    this.orientation = quat.multiply(quat.create(), combinedQuat, this.orientation)
    quat.normalize(this.orientation, this.orientation)

    const RA_INTENSITY = 0.8 * timeScale
    quat.slerp(this.combinedQuat, this.combinedQuat, combinedQuat, RA_INTENSITY)
    quat.normalize(this.combinedQuat, this.combinedQuat)

    const rad = Math.acos(this.combinedQuat[3]) * 2.0
    const s = Math.sin(rad / 2.0)
    let rv = 0
    if (s > 0.000001) {
      rv = rad / (2 * Math.PI)
      this.rotationAxis[0] = this.combinedQuat[0] / s
      this.rotationAxis[1] = this.combinedQuat[1] / s
      this.rotationAxis[2] = this.combinedQuat[2] / s
    }

    const RV_INTENSITY = 0.5 * timeScale
    this.smoothedVelocity += (rv - this.smoothedVelocity) * RV_INTENSITY
    this.rotationVelocity = this.smoothedVelocity / timeScale

    this.updateCallback(deltaTime)
  }

  private quatFromVectors(a: vec3, b: vec3, out: quat, angleFactor = 1): void {
    const axis = vec3.cross(vec3.create(), a, b)
    vec3.normalize(axis, axis)
    const d = Math.max(-1, Math.min(1, vec3.dot(a, b)))
    const angle = Math.acos(d) * angleFactor
    quat.setAxisAngle(out, axis, angle)
  }

  private project(pos: vec2): vec3 {
    const r = 2
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const s = Math.max(w, h) - 1

    const x = (2 * pos[0] - w - 1) / s
    const y = (2 * pos[1] - h - 1) / s
    let z = 0
    const xySq = x * x + y * y
    const rSq = r * r

    if (xySq <= rSq / 2.0) {
      z = Math.sqrt(rSq - xySq)
    } else {
      z = rSq / Math.sqrt(xySq)
    }
    return vec3.fromValues(-x, y, z)
  }
}

type Camera = {
  matrix: mat4
  near: number
  far: number
  fov: number
  aspect: number
  position: vec3
  up: vec3
  matrices: { view: mat4; projection: mat4; inverseProjection: mat4 }
}

/** Frames of stillness before the engine stops drawing until something changes. */
const IDLE_FRAMES_BEFORE_REST = 20

class SphereEngine {
  private readonly canvas: HTMLCanvasElement
  private readonly itemCount: number
  private readonly onActiveChange: (index: number) => void
  private readonly onMovementChange: (moving: boolean) => void

  private readonly gl: WebGL2RenderingContext
  private readonly program: WebGLProgram
  private readonly vao: WebGLVertexArrayObject
  private readonly indexCount: number
  private readonly locations: {
    aModelPosition: number
    aModelUvs: number
    aInstanceMatrix: number
    uWorldMatrix: WebGLUniformLocation | null
    uViewMatrix: WebGLUniformLocation | null
    uProjectionMatrix: WebGLUniformLocation | null
    uRotationAxisVelocity: WebGLUniformLocation | null
    uTex: WebGLUniformLocation | null
    uItemCount: WebGLUniformLocation | null
    uAtlasSize: WebGLUniformLocation | null
  }
  private readonly instanceBuffer: WebGLBuffer | null
  private readonly matricesArray: Float32Array
  private readonly matrices: Float32Array[]
  private readonly instancePositions: vec3[]
  private readonly instanceCount: number
  private readonly texture: WebGLTexture
  private readonly control: ArcballControl
  private readonly worldMatrix = mat4.create()
  public readonly maxTextureSize: number

  private readonly SPHERE_RADIUS = 2
  private readonly TARGET_FRAME_DURATION = 1000 / 60
  private readonly camera: Camera = {
    matrix: mat4.create(),
    near: 0.1,
    far: 40,
    fov: Math.PI / 4,
    aspect: 1,
    position: vec3.fromValues(0, 0, 3),
    up: vec3.fromValues(0, 1, 0),
    matrices: { view: mat4.create(), projection: mat4.create(), inverseProjection: mat4.create() },
  }

  private atlasPerRow = 1
  private time = 0
  private frameId = 0
  private idleFrames = 0
  private dirty = true
  private movementActive = false
  private smoothRotationVelocity = 0

  constructor(
    canvas: HTMLCanvasElement,
    itemCount: number,
    onActiveChange: (index: number) => void,
    onMovementChange: (moving: boolean) => void,
  ) {
    this.canvas = canvas
    this.itemCount = Math.max(1, itemCount)
    this.onActiveChange = onActiveChange
    this.onMovementChange = onMovementChange

    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true })
    if (!gl) throw new Error('WebGL 2 is not available.')
    this.gl = gl
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number

    const program = createProgram(gl, [discVertShaderSource, discFragShaderSource], {
      aModelPosition: 0,
      aModelNormal: 1,
      aModelUvs: 2,
      aInstanceMatrix: 3,
    })
    if (!program) throw new Error('Sphere shaders failed to build.')
    this.program = program

    this.locations = {
      aModelPosition: gl.getAttribLocation(program, 'aModelPosition'),
      aModelUvs: gl.getAttribLocation(program, 'aModelUvs'),
      aInstanceMatrix: gl.getAttribLocation(program, 'aInstanceMatrix'),
      uWorldMatrix: gl.getUniformLocation(program, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      uRotationAxisVelocity: gl.getUniformLocation(program, 'uRotationAxisVelocity'),
      uTex: gl.getUniformLocation(program, 'uTex'),
      uItemCount: gl.getUniformLocation(program, 'uItemCount'),
      uAtlasSize: gl.getUniformLocation(program, 'uAtlasSize'),
    }

    const disc = new DiscGeometry(56, 1).data
    this.indexCount = disc.indices.length
    const vao = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, disc.vertices, gl.STATIC_DRAW), this.locations.aModelPosition, 3],
        [makeBuffer(gl, disc.uvs, gl.STATIC_DRAW), this.locations.aModelUvs, 2],
      ],
      disc.indices,
    )
    if (!vao) throw new Error('Sphere vertex array failed.')
    this.vao = vao

    const ico = new IcosahedronGeometry().subdivide(1).spherize(this.SPHERE_RADIUS)
    this.instancePositions = ico.vertices.map((v) => v.position)
    this.instanceCount = ico.vertices.length

    this.matricesArray = new Float32Array(this.instanceCount * 16)
    this.matrices = []
    for (let i = 0; i < this.instanceCount; ++i) {
      const instanceMatrix = new Float32Array(this.matricesArray.buffer, i * 16 * 4, 16)
      mat4.identity(instanceMatrix as unknown as mat4)
      this.matrices.push(instanceMatrix)
    }

    this.instanceBuffer = gl.createBuffer()
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.matricesArray.byteLength, gl.DYNAMIC_DRAW)
    for (let j = 0; j < 4; ++j) {
      const loc = this.locations.aInstanceMatrix + j
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 16 * 4, j * 4 * 4)
      gl.vertexAttribDivisor(loc, 1)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindVertexArray(null)

    const texture = gl.createTexture()
    if (!texture) throw new Error('Failed to create WebGL texture.')
    this.texture = texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]),
    )

    this.control = new ArcballControl(canvas, (deltaTime) => this.onControlUpdate(deltaTime))
    this.updateCameraMatrix()
    this.resize()
  }

  public setAtlas(atlas: HTMLCanvasElement, perRow: number): void {
    const gl = this.gl
    this.atlasPerRow = perRow
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.generateMipmap(gl.TEXTURE_2D)
    this.dirty = true
  }

  public resize(): void {
    if (resizeCanvasToDisplaySize(this.canvas)) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
    }
    this.updateProjectionMatrix()
    this.dirty = true
  }

  public start(): void {
    if (this.frameId) return
    const loop = (time: number) => {
      this.frameId = requestAnimationFrame(loop)
      this.step(time)
    }
    this.frameId = requestAnimationFrame((time) => {
      this.time = time
      loop(time)
    })
  }

  public stop(): void {
    cancelAnimationFrame(this.frameId)
    this.frameId = 0
  }

  public destroy(): void {
    this.stop()
    this.control.destroy()
  }

  private step(time: number): void {
    const deltaTime = Math.min(32, time - this.time)
    this.time = time

    // Once the sphere has come to rest, stop spending frames until the pointer
    // goes down or something (a resize, a new atlas) needs redrawing.
    const resting = !this.control.isPointerDown && this.idleFrames > IDLE_FRAMES_BEFORE_REST
    if (resting && !this.dirty) return

    this.animate(deltaTime)
    this.render()
    this.dirty = false

    const still = !this.control.isPointerDown && Math.abs(this.smoothRotationVelocity) < 1e-4
    this.idleFrames = still ? this.idleFrames + 1 : 0
  }

  private animate(deltaTime: number): void {
    const gl = this.gl
    this.control.update(deltaTime, this.TARGET_FRAME_DURATION)

    const positions = this.instancePositions.map((p) =>
      vec3.transformQuat(vec3.create(), p, this.control.orientation),
    )
    const scale = 0.25
    const SCALE_INTENSITY = 0.6

    positions.forEach((p, ndx) => {
      const s = (Math.abs(p[2]) / this.SPHERE_RADIUS) * SCALE_INTENSITY + (1 - SCALE_INTENSITY)
      const finalScale = s * scale
      const matrix = mat4.create()

      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), p)))
      mat4.multiply(matrix, matrix, mat4.targetTo(mat4.create(), [0, 0, 0], p, [0, 1, 0]))
      mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]))
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [0, 0, -this.SPHERE_RADIUS]))

      mat4.copy(this.matrices[ndx] as unknown as mat4, matrix)
    })

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.matricesArray)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    this.smoothRotationVelocity = this.control.rotationVelocity
  }

  private render(): void {
    const gl = this.gl

    gl.useProgram(this.program)
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniformMatrix4fv(this.locations.uWorldMatrix, false, this.worldMatrix)
    gl.uniformMatrix4fv(this.locations.uViewMatrix, false, this.camera.matrices.view)
    gl.uniformMatrix4fv(this.locations.uProjectionMatrix, false, this.camera.matrices.projection)
    gl.uniform4f(
      this.locations.uRotationAxisVelocity,
      this.control.rotationAxis[0],
      this.control.rotationAxis[1],
      this.control.rotationAxis[2],
      this.smoothRotationVelocity * 1.1,
    )
    gl.uniform1i(this.locations.uItemCount, this.itemCount)
    gl.uniform1i(this.locations.uAtlasSize, this.atlasPerRow)

    gl.uniform1i(this.locations.uTex, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.bindVertexArray(this.vao)
    gl.drawElementsInstanced(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0, this.instanceCount)
    gl.bindVertexArray(null)
  }

  private updateCameraMatrix(): void {
    mat4.targetTo(this.camera.matrix, this.camera.position, [0, 0, 0], this.camera.up)
    mat4.invert(this.camera.matrices.view, this.camera.matrix)
  }

  private updateProjectionMatrix(): void {
    const canvasEl = this.gl.canvas as HTMLCanvasElement
    this.camera.aspect = canvasEl.clientWidth / Math.max(1, canvasEl.clientHeight)
    const height = this.SPHERE_RADIUS * 0.35
    const distance = this.camera.position[2]
    if (this.camera.aspect > 1) {
      this.camera.fov = 2 * Math.atan(height / distance)
    } else {
      this.camera.fov = 2 * Math.atan(height / this.camera.aspect / distance)
    }
    mat4.perspective(
      this.camera.matrices.projection,
      this.camera.fov,
      this.camera.aspect,
      this.camera.near,
      this.camera.far,
    )
    mat4.invert(this.camera.matrices.inverseProjection, this.camera.matrices.projection)
  }

  private onControlUpdate(deltaTime: number): void {
    const timeScale = deltaTime / this.TARGET_FRAME_DURATION + 0.0001
    let damping = 5 / timeScale
    let cameraTargetZ = 3

    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01
    if (isMoving !== this.movementActive) {
      this.movementActive = isMoving
      this.onMovementChange(isMoving)
    }

    if (!this.control.isPointerDown) {
      const nearestVertexIndex = this.findNearestVertexIndex()
      this.onActiveChange(nearestVertexIndex % this.itemCount)
      this.control.snapTargetDirection = vec3.normalize(
        vec3.create(),
        this.getVertexWorldPosition(nearestVertexIndex),
      )
    } else {
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5
      damping = 7 / timeScale
    }

    this.camera.position[2] += (cameraTargetZ - this.camera.position[2]) / damping
    this.updateCameraMatrix()
  }

  private findNearestVertexIndex(): number {
    const n = this.control.snapDirection
    const inverseOrientation = quat.conjugate(quat.create(), this.control.orientation)
    const nt = vec3.transformQuat(vec3.create(), n, inverseOrientation)

    let maxD = -1
    let nearestVertexIndex = 0
    for (let i = 0; i < this.instancePositions.length; ++i) {
      const d = vec3.dot(nt, this.instancePositions[i])
      if (d > maxD) {
        maxD = d
        nearestVertexIndex = i
      }
    }
    return nearestVertexIndex
  }

  private getVertexWorldPosition(index: number): vec3 {
    return vec3.transformQuat(vec3.create(), this.instancePositions[index], this.control.orientation)
  }
}

export type SphereItem = { title: string; group: string; note: string }

/** Tile layout is authored in these units, then scaled to the real cell size. */
const DESIGN_CELL = 256
const MAX_CELL = 384
const MIN_CELL = 128
const DISPLAY_FONT = "'Archivo Variable', Archivo, system-ui, sans-serif"
const MONO_FONT = "'JetBrains Mono Variable', ui-monospace, monospace"

/** Largest size at which the name fits the tile, splitting onto two lines if needed. */
function fitTitle(ctx: CanvasRenderingContext2D, title: string): { lines: string[]; size: number } {
  const maxWidth = DESIGN_CELL * 0.72
  for (let size = 42; size >= 26; size -= 2) {
    ctx.font = `800 ${size}px ${DISPLAY_FONT}`
    if (ctx.measureText(title).width <= maxWidth) return { lines: [title], size }
  }

  const words = title.split(' ')
  if (words.length === 1) return { lines: [title], size: 24 }

  ctx.font = `800 30px ${DISPLAY_FONT}`
  let best: string[] = [title]
  let bestWidth = Number.POSITIVE_INFINITY
  for (let i = 1; i < words.length; i++) {
    const pair = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
    const width = Math.max(...pair.map((line) => ctx.measureText(line).width))
    if (width < bestWidth) {
      bestWidth = width
      best = pair
    }
  }
  for (let size = 36; size >= 18; size -= 2) {
    ctx.font = `800 ${size}px ${DISPLAY_FONT}`
    if (best.every((line) => ctx.measureText(line).width <= maxWidth)) return { lines: best, size }
  }
  return { lines: best, size: 18 }
}

function drawAtlas(
  items: SphereItem[],
  tokens: ThemeTokens,
  maxTextureSize: number,
): { canvas: HTMLCanvasElement; perRow: number } {
  const perRow = Math.ceil(Math.sqrt(items.length))
  const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(maxTextureSize / perRow)))
  const scale = cell / DESIGN_CELL
  const canvas = document.createElement('canvas')
  canvas.width = perRow * cell
  canvas.height = perRow * cell
  const ctx = canvas.getContext('2d')
  if (!ctx) return { canvas, perRow }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
  const cx = DESIGN_CELL / 2
  const cy = DESIGN_CELL / 2

  items.forEach((item, index) => {
    // Draw every tile in design units; the transform places and scales it.
    ctx.setTransform(scale, 0, 0, scale, (index % perRow) * cell, Math.floor(index / perRow) * cell)

    ctx.fillStyle = tokens.surface
    ctx.fillRect(0, 0, DESIGN_CELL, DESIGN_CELL)
    ctx.strokeStyle = tokens.line
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(cx, cy, DESIGN_CELL / 2 - 4, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = tokens.accentText
    ctx.font = `500 13px ${MONO_FONT}`
    if ('letterSpacing' in spaced) spaced.letterSpacing = '2px'
    ctx.fillText(item.group.toUpperCase(), cx, cy - 54)
    if ('letterSpacing' in spaced) spaced.letterSpacing = '0px'

    ctx.fillStyle = tokens.text
    const { lines, size } = fitTitle(ctx, item.title)
    ctx.font = `800 ${size}px ${DISPLAY_FONT}`
    const lineHeight = size * 1.02
    const firstY = cy + 8 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, i) => ctx.fillText(line, cx, firstY + i * lineHeight))
  })

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  return { canvas, perRow }
}

export default function StackSphere({
  items,
  onUnsupported,
}: {
  items: SphereItem[]
  onUnsupported: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SphereEngine | null>(null)
  const tokens = useThemeTokens()
  const [activeIndex, setActiveIndex] = useState(0)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let engine: SphereEngine
    try {
      engine = new SphereEngine(canvas, items.length, setActiveIndex, setMoving)
    } catch {
      onUnsupported()
      return
    }
    engineRef.current = engine

    const resizeObserver = new ResizeObserver(() => engine.resize())
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) engine.start()
      else engine.stop()
    })
    visibility.observe(canvas)

    return () => {
      visibility.disconnect()
      resizeObserver.disconnect()
      engine.destroy()
      engineRef.current = null
    }
  }, [items.length, onUnsupported])

  useEffect(() => {
    if (!tokens) return
    let cancelled = false
    // Tiles are drawn with the site's fonts, so wait for them before painting.
    void document.fonts.ready.then(() => {
      const engine = engineRef.current
      if (cancelled || !engine) return
      const { canvas, perRow } = drawAtlas(items, tokens, engine.maxTextureSize)
      engine.setAtlas(canvas, perRow)
    })
    return () => {
      cancelled = true
    }
  }, [items, tokens])

  const active = items[activeIndex % items.length]

  return (
    <div className="relative h-[34rem] w-full overflow-hidden rounded-lg border border-line">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="h-full w-full cursor-grab outline-none active:cursor-grabbing"
      />

      <p
        aria-hidden="true"
        className="mono-label pointer-events-none absolute top-4 left-5 text-muted"
      >
        Drag to turn · {items.length} tools
      </p>

      {active ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-linear-to-t from-bg via-bg/85 to-transparent p-5 pt-16 transition-opacity duration-300 sm:flex-row sm:items-end sm:justify-between ${
            moving ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div>
            <p className="mono-label text-accent-text">{active.group}</p>
            <p className="mt-2 font-display text-3xl leading-none font-extrabold">{active.title}</p>
          </div>
          <p className="max-w-[34ch] text-sm text-muted sm:text-right">{active.note}</p>
        </div>
      ) : null}
    </div>
  )
}
