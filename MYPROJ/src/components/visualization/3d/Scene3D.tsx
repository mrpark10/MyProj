/**
 * 3D 씬 컨테이너 — 카메라·조명·바닥·궤도 컨트롤을 구성한다.
 * 물리 시뮬레이션은 자식 컴포넌트(ArrayBars3D / GraphScene3D)의 useFrame 에서 수행된다.
 */
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';

interface Scene3DProps {
  children: ReactNode;
  /** 바닥 그리드 표시 여부 (그래프 씬은 공중에 뜨므로 숨김) */
  showGround?: boolean;
}

export function Scene3D({ children, showGround = true }: Scene3DProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 6, 14], fov: 50 }}
      // 컨텍스트 손실 시에도 앱이 죽지 않도록 기본값 유지
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b1020']} />
      <fog attach="fog" args={['#0b1020', 22, 45]} />

      {/* 조명 */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 8, -6]} intensity={0.5} color="#6366f1" />

      {showGround && (
        <>
          {/* 그림자를 받는 바닥 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#141b32" roughness={0.9} metalness={0.1} />
          </mesh>
          <Grid
            position={[0, 0.01, 0]}
            args={[60, 60]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#243055"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#3b4a7a"
            fadeDistance={38}
            infiniteGrid
          />
        </>
      )}

      {children}

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 2.5, 0]}
      />
    </Canvas>
  );
}
