/**
 * 자체 구현 물리 엔진 단위 테스트.
 * 렌더러 없이 순수 계산만 검증한다.
 */
import { distanceSquared, FIXED_DT, lengthSquared, PhysicsWorld, vec3 } from '@/physics/engine';

/** dt 를 고정 스텝으로 n 번 진행 */
function simulate(world: PhysicsWorld, steps: number): void {
  for (let i = 0; i < steps; i += 1) world.step(FIXED_DT);
}

describe('중력과 적분', () => {
  it('중력이 작용하면 아래로 떨어진다', () => {
    const world = new PhysicsWorld();
    const body = world.addBody({ id: 'a', position: vec3(0, 10, 0), halfExtent: 0.5 });

    simulate(world, 30);

    expect(body.position.y).toBeLessThan(10);
    expect(body.velocity.y).toBeLessThan(0);
  });

  it('gravityScale 이 0 이면 떨어지지 않는다', () => {
    const world = new PhysicsWorld();
    const body = world.addBody({ id: 'a', position: vec3(0, 10, 0), gravityScale: 0 });

    simulate(world, 60);

    expect(body.position.y).toBeCloseTo(10, 5);
  });

  it('자유낙하 거리가 이론값(½gt²)과 근사한다', () => {
    // 감쇠의 영향을 배제하기 위해 damping 0 으로 설정
    const world = new PhysicsWorld({ linearDamping: 0, gravity: -10, groundY: -1000 });
    const body = world.addBody({ id: 'a', position: vec3(0, 0, 0), halfExtent: 0 });

    const steps = 120; // 1초
    simulate(world, steps);

    const t = steps * FIXED_DT;
    const expected = 0.5 * -10 * t * t; // ≈ -5
    // 오일러 적분 오차를 감안해 5% 이내
    expect(body.position.y).toBeGreaterThan(expected * 1.05);
    expect(body.position.y).toBeLessThan(expected * 0.95);
  });
});

describe('바닥 충돌과 반발', () => {
  it('바닥을 뚫고 내려가지 않는다', () => {
    const world = new PhysicsWorld({ groundY: 0 });
    const body = world.addBody({ id: 'a', position: vec3(0, 8, 0), halfExtent: 0.5 });

    simulate(world, 600);

    expect(body.position.y).toBeGreaterThanOrEqual(0.5 - 1e-6);
  });

  it('튕긴 높이는 처음 낙하 높이보다 낮다 (에너지 손실)', () => {
    const world = new PhysicsWorld({ groundY: 0, restitution: 0.5 });
    const startY = 6;
    const body = world.addBody({ id: 'a', position: vec3(0, startY, 0), halfExtent: 0.5 });

    let maxAfterBounce = 0;
    let bounced = false;
    for (let i = 0; i < 600; i += 1) {
      world.step(FIXED_DT);
      if (!bounced && body.velocity.y > 0) bounced = true;
      if (bounced) maxAfterBounce = Math.max(maxAfterBounce, body.position.y);
    }

    expect(bounced).toBe(true);
    expect(maxAfterBounce).toBeLessThan(startY);
  });

  it('충분한 시간이 지나면 바닥에서 정지한다', () => {
    const world = new PhysicsWorld({ groundY: 0 });
    const body = world.addBody({ id: 'a', position: vec3(0, 5, 0), halfExtent: 0.5 });

    simulate(world, 1200);

    expect(body.position.y).toBeCloseTo(0.5, 1);
    expect(lengthSquared(body.velocity)).toBeLessThan(0.01);
  });
});

describe('스프링-댐퍼 구속', () => {
  it('목표 위치로 수렴한다', () => {
    const world = new PhysicsWorld({ gravity: 0 });
    const target = vec3(5, 3, -2);
    const body = world.addBody({ id: 'a', position: vec3(0, 3, 0), target, gravityScale: 0 });

    simulate(world, 600);

    expect(distanceSquared(body.position, target)).toBeLessThan(0.01);
  });

  it('목표를 바꾸면 새 위치로 이동한다', () => {
    const world = new PhysicsWorld();
    const body = world.addBody({ id: 'a', position: vec3(0, 1, 0), target: vec3(0, 1, 0), gravityScale: 0 });

    simulate(world, 300);
    world.setTarget('a', vec3(8, 1, 0));
    simulate(world, 600);

    expect(body.position.x).toBeCloseTo(8, 1);
  });

  it('목표 변경 시 슬리핑이 해제된다', () => {
    const world = new PhysicsWorld();
    const body = world.addBody({ id: 'a', position: vec3(0, 1, 0), target: vec3(0, 1, 0), gravityScale: 0 });

    simulate(world, 600);
    expect(body.sleeping).toBe(true);

    world.setTarget('a', vec3(4, 1, 0));
    expect(body.sleeping).toBe(false);
  });
});

describe('충격량(impulse)', () => {
  it('위로 충격량을 주면 튀어오른다', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'a', position: vec3(0, 0.5, 0), halfExtent: 0.5 });

    world.applyImpulse('a', vec3(0, 10, 0));
    const body = world.getBody('a');

    expect(body?.velocity.y).toBeCloseTo(10, 5);
  });

  it('질량이 클수록 같은 충격량에 덜 움직인다 (Δv = J/m)', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'light', position: vec3(0, 1, 0), mass: 1 });
    world.addBody({ id: 'heavy', position: vec3(0, 1, 0), mass: 4 });

    world.applyImpulse('light', vec3(0, 8, 0));
    world.applyImpulse('heavy', vec3(0, 8, 0));

    expect(world.getBody('light')?.velocity.y).toBeCloseTo(8, 5);
    expect(world.getBody('heavy')?.velocity.y).toBeCloseTo(2, 5);
  });

  it('잠든 body 도 충격량을 받으면 깨어난다', () => {
    const world = new PhysicsWorld();
    const body = world.addBody({ id: 'a', position: vec3(0, 0.5, 0), halfExtent: 0.5 });

    simulate(world, 1200);
    expect(body.sleeping).toBe(true);

    world.applyImpulse('a', vec3(0, 6, 0));
    expect(body.sleeping).toBe(false);
  });
});

describe('감쇠와 슬리핑', () => {
  it('감쇠에 의해 총 운동에너지가 줄어든다', () => {
    const world = new PhysicsWorld({ gravity: 0 });
    world.addBody({ id: 'a', position: vec3(0, 5, 0), gravityScale: 0 });
    world.applyImpulse('a', vec3(4, 0, 0));

    const before = world.totalKineticEnergy();
    simulate(world, 120);
    const after = world.totalKineticEnergy();

    expect(after).toBeLessThan(before);
  });

  it('정지한 body 는 슬리핑 상태가 되어 계산을 건너뛴다', () => {
    const world = new PhysicsWorld();
    const body = world.addBody({ id: 'a', position: vec3(0, 0.5, 0), halfExtent: 0.5 });

    simulate(world, 1200);

    expect(body.sleeping).toBe(true);
    expect(body.velocity.x).toBe(0);
    expect(body.velocity.y).toBe(0);
  });
});

describe('고정 timestep 누산기', () => {
  it('delta 에 비례한 서브스텝을 실행한다', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'a', position: vec3(0, 5, 0) });

    // FIXED_DT = 1/120 이므로 1/60 초는 2 스텝
    expect(world.update(1 / 60)).toBe(2);
  });

  it('너무 작은 delta 는 누적만 하고 실행하지 않는다', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'a', position: vec3(0, 5, 0) });

    expect(world.update(0.001)).toBe(0);
  });

  it('거대한 delta 에도 서브스텝 수가 제한된다 (죽음의 나선 방지)', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'a', position: vec3(0, 5, 0) });

    expect(world.update(100)).toBeLessThanOrEqual(8);
  });

  it('같은 입력이면 항상 같은 결과를 낸다 (결정적 시뮬레이션)', () => {
    const run = (): number => {
      const world = new PhysicsWorld();
      const body = world.addBody({ id: 'a', position: vec3(0, 7, 0), halfExtent: 0.5 });
      simulate(world, 240);
      return body.position.y;
    };

    expect(run()).toBe(run());
  });
});

describe('월드 관리', () => {
  it('body 를 추가·조회·삭제할 수 있다', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'a', position: vec3() });
    world.addBody({ id: 'b', position: vec3() });

    expect(world.count).toBe(2);
    expect(world.getBody('a')).toBeDefined();

    world.removeBody('a');
    expect(world.count).toBe(1);
    expect(world.getBody('a')).toBeUndefined();
  });

  it('clear 로 전체를 비운다', () => {
    const world = new PhysicsWorld();
    world.addBody({ id: 'a', position: vec3() });
    world.clear();

    expect(world.count).toBe(0);
    expect(world.bodyList).toEqual([]);
  });

  it('존재하지 않는 body 조작은 무시한다 (예외 없음)', () => {
    const world = new PhysicsWorld();
    expect(() => world.applyImpulse('none', vec3(1, 1, 1))).not.toThrow();
    expect(() => world.setTarget('none', vec3())).not.toThrow();
  });
});
