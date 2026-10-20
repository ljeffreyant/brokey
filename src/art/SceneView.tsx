import React, { memo, useId, useMemo } from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';
import { Scene, viewBoxOf } from './scene';

export interface SceneViewProps {
  scene: Scene;
  width: number;
  /** only draw these layers (they keep the scene's own coordinates, so stacked layers line up) */
  groups?: string[];
}

/** Renders a scene-graph drawing with react-native-svg. Same drawing as the PNG icon. */
function SceneViewBase({ scene, width, groups }: SceneViewProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [vx, vy, vw, vh] = viewBoxOf(scene);
  const height = (width * vh) / vw;

  const prims = useMemo(
    () => scene.prims.filter((p) => !groups || (p.g != null && groups.includes(p.g))),
    [scene, groups],
  );
  const usedClips = useMemo(() => new Set(prims.map((p) => p.clip).filter(Boolean) as string[]), [prims]);

  return (
    <Svg width={width} height={height} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
      <Defs>
        {scene.defs
          .filter((d) => usedClips.has(d.id))
          .map((d) => (
            <ClipPath id={`${uid}${d.id}`} key={d.id}>
              <Path d={d.d} />
            </ClipPath>
          ))}
      </Defs>
      <G transform={scene.tilt}>
        {prims.map((p, i) => (
          <Path
            key={i}
            d={p.d}
            fill={p.fill ?? 'none'}
            stroke={p.stroke}
            strokeWidth={p.sw}
            opacity={p.op}
            strokeLinecap={p.cap}
            strokeLinejoin={p.join}
            clipPath={p.clip ? `url(#${uid}${p.clip})` : undefined}
            transform={p.transform}
          />
        ))}
      </G>
    </Svg>
  );
}

export const SceneView = memo(SceneViewBase);
