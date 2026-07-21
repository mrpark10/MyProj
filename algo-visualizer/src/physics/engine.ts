/**
 * 자체 구현 3D 물리 엔진 (외부 물리 라이브러리 미사용)
 *
 * 구현한 물리 요소:
 *  1. 반암시적 오일러 적분 (Semi-implicit Euler) — v += a·dt, p += v·dt
 *  2. 중력 (body 별 gravityScale 로 on/off)
 *  3. 스프링-댐퍼 구속 (Hooke's law: F = -k·x - c·v) — 목표 위치로 부드럽게 이동
 *  4. 바닥 충돌 + 반발계수(restitution) 기반 튕김
 *  5. 바닥 마찰 (수평 속도 감쇠)
 *  6. 공기 저항(linear damping)
 *  7. 슬리핑 — 미세 진동 시 계산 중단으로 성능 확보
 *  8. 고정 timestep 누산기 — 프레임레이트와 무관하게 결정적(deterministic) 시뮬레이션
 *
 * 렌더러(Three.js)에 의존하지 않는 순수 TypeScript 모듈이므로 Node 환경에서 단위 테스트가 가능하다.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function addScaled(target: Vec3, source: Vec3, scale: number): void {
  target.x += source.x * scale;
  target.y += source.y * scale;
  target.z += source.z * scale;
}

export function lengthSquared(v: Vec3): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

export function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export interface PhysicsBody {
  id: string;
  position: Vec3;
  velocity: Vec3;
  /** 스프링이 끌어당길 목표 위치. null 이면 자유 운동. */
  target: Vec3 | null;
  mass: number;
  /** 바닥 충돌 판정용 반높이 (박스의 절반 높이 / 구의 반지름) */
  halfExtent: number;
  /** 중력 배율 (0 = 무중력, 1 = 기본 중력) */
  gravityScale: number;
  /** 슬리핑 상태 — true 면 적분을 건너뛴다. */
  sleeping: boolean;
}

export interface PhysicsConfig {
  /** 중력 가속도 (음수 = 아래 방향) */
  gravity: number;
  /** 반발계수 0~1 (1 = 완전 탄성) */
  restitution: number;
  /** 공기 저항 계수 (1/s) */
  linearDamping: number;
  /** 바닥 마찰 계수 0~1 */
  friction: number;
  /** 스프링 강성 k */
  springStiffness: number;
  /** 스프링 감쇠 c */
  springDamping: number;
  /** 바닥 높이 */
  groundY: number;
  /** 이 속도(제곱) 미만이면 슬리핑 후보 */
  sleepThreshold: number;
}

export const DEFAULT_CONFIG: PhysicsConfig = {
  gravity: -26,
  restitution: 0.42,
  linearDamping: 0.9,
  friction: 0.28,
  springStiffness: 190,
  springDamping: 19,
  groundY: 0,
  sleepThreshold: 0.0016,
};

export interface BodyOptions {
  id: string;
  position: Vec3;
  target?: Vec3 | null;
  mass?: number;
  halfExtent?: number;
  gravityScale?: number;
}

/** 고정 timestep — 프레임레이트와 무관하게 동일한 결과를 보장한다. */
export const FIXED_DT = 1 / 120;
/** 한 프레임에 허용하는 최대 서브스텝 (죽음의 나선 방지) */
const MAX_SUBSTEPS = 8;

export class PhysicsWorld {
  readonly config: PhysicsConfig;
  private readonly bodies = new Map<string, PhysicsBody>();
  private accumulator = 0;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  addBody(options: BodyOptions): PhysicsBody {
    const body: PhysicsBody = {
      id: options.id,
      position: { ...options.position },
      velocity: vec3(),
      target: options.target ? { ...options.target } : null,
      mass: options.mass ?? 1,
      halfExtent: options.halfExtent ?? 0.5,
      gravityScale: options.gravityScale ?? 1,
      sleeping: false,
    };
    this.bodies.set(body.id, body);
    return body;
  }

  removeBody(id: string): void {
    this.bodies.delete(id);
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  get bodyList(): PhysicsBody[] {
    return [...this.bodies.values()];
  }

  get count(): number {
    return this.bodies.size;
  }

  clear(): void {
    this.bodies.clear();
    this.accumulator = 0;
  }

  /** 목표 위치를 갱신하고 body 를 깨운다. */
  setTarget(id: string, target: Vec3 | null): void {
    const body = this.bodies.get(id);
    if (!body) return;
    body.target = target ? { ...target } : null;
    body.sleeping = false;
  }

  /** 충격량을 가해 body 를 즉시 깨우고 속도를 바꾼다. (Δv = J / m) */
  applyImpulse(id: string, impulse: Vec3): void {
    const body = this.bodies.get(id);
    if (!body) return;
    body.velocity.x += impulse.x / body.mass;
    body.velocity.y += impulse.y / body.mass;
    body.velocity.z += impulse.z / body.mass;
    body.sleeping = false;
  }

  /**
   * 가변 프레임 시간을 고정 스텝으로 나눠 시뮬레이션한다.
   * @returns 실제로 실행된 서브스텝 수
   */
  update(deltaSeconds: number): number {
    // 탭 전환 등으로 큰 delta 가 들어오면 잘라낸다.
    this.accumulator += Math.min(Math.max(deltaSeconds, 0), 0.25);

    let steps = 0;
    while (this.accumulator >= FIXED_DT && steps < MAX_SUBSTEPS) {
      this.step(FIXED_DT);
      this.accumulator -= FIXED_DT;
      steps += 1;
    }
    if (steps === MAX_SUBSTEPS) this.accumulator = 0;
    return steps;
  }

  /** 단일 고정 스텝 적분 (테스트에서 직접 호출 가능) */
  step(dt: number): void {
    const { gravity, restitution, linearDamping, friction, springStiffness, springDamping, groundY, sleepThreshold } =
      this.config;

    for (const body of this.bodies.values()) {
      if (body.sleeping) continue;

      // --- 1) 힘 누적 → 가속도 ---
      const acceleration = vec3(0, gravity * body.gravityScale, 0);

      // 스프링-댐퍼: F = k(target - p) - c·v
      if (body.target) {
        const fx = springStiffness * (body.target.x - body.position.x) - springDamping * body.velocity.x;
        const fy = springStiffness * (body.target.y - body.position.y) - springDamping * body.velocity.y;
        const fz = springStiffness * (body.target.z - body.position.z) - springDamping * body.velocity.z;
        acceleration.x += fx / body.mass;
        acceleration.y += fy / body.mass;
        acceleration.z += fz / body.mass;
      }

      // --- 2) 반암시적 오일러 적분 ---
      addScaled(body.velocity, acceleration, dt);

      // 공기 저항 (지수 감쇠)
      const damp = Math.max(0, 1 - linearDamping * dt);
      body.velocity.x *= damp;
      body.velocity.y *= damp;
      body.velocity.z *= damp;

      addScaled(body.position, body.velocity, dt);

      // --- 3) 바닥 충돌 ---
      const floor = groundY + body.halfExtent;
      if (body.position.y < floor) {
        body.position.y = floor;
        if (body.velocity.y < 0) {
          body.velocity.y = -body.velocity.y * restitution;
          // 너무 약한 튕김은 제거해 진동을 방지
          if (Math.abs(body.velocity.y) < 0.35) body.velocity.y = 0;
        }
        // 바닥 마찰 — 수평 속도 감쇠
        const keep = Math.max(0, 1 - friction);
        body.velocity.x *= keep;
        body.velocity.z *= keep;
      }

      // --- 4) 슬리핑 판정 ---
      const slow = lengthSquared(body.velocity) < sleepThreshold;
      const atTarget = body.target ? distanceSquared(body.position, body.target) < sleepThreshold : true;
      const onGround = body.position.y <= floor + 1e-4;

      if (slow && atTarget && (onGround || body.gravityScale === 0)) {
        body.sleeping = true;
        body.velocity.x = 0;
        body.velocity.y = 0;
        body.velocity.z = 0;
        if (body.target) {
          body.position.x = body.target.x;
          body.position.y = body.target.y;
          body.position.z = body.target.z;
        }
      }
    }
  }

  /** 전체 운동 에너지 (테스트/디버깅용): Σ ½mv² */
  totalKineticEnergy(): number {
    let energy = 0;
    for (const body of this.bodies.values()) {
      energy += 0.5 * body.mass * lengthSquared(body.velocity);
    }
    return energy;
  }
}
