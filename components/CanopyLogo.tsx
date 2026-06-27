"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

export const LOGO_VIEWBOX = {
  width: 743,
  height: 169,
};

export const PUPIL_CENTER = {
  x: 440.36,
  y: 87.11,
};

const EYE_MASK = {
  cx: PUPIL_CENTER.x,
  cy: PUPIL_CENTER.y,
  rx: 63,
  ry: 31,
};

const STAR_PATH =
  `M ${PUPIL_CENTER.x} ${PUPIL_CENTER.y - 25}
   L ${PUPIL_CENTER.x + 7.6} ${PUPIL_CENTER.y - 7.6}
   L ${PUPIL_CENTER.x + 25} ${PUPIL_CENTER.y}
   L ${PUPIL_CENTER.x + 7.6} ${PUPIL_CENTER.y + 7.6}
   L ${PUPIL_CENTER.x} ${PUPIL_CENTER.y + 25}
   L ${PUPIL_CENTER.x - 7.6} ${PUPIL_CENTER.y + 7.6}
   L ${PUPIL_CENTER.x - 25} ${PUPIL_CENTER.y}
   L ${PUPIL_CENTER.x - 7.6} ${PUPIL_CENTER.y - 7.6}
   Z`;

const MAX_PUPIL_SHIFT = 10;
const PUPIL_LIMIT = {
  x: 18,
  y: 5.5,
};

function getPupilTransform(x: number, y: number, rotate: number, scale: number) {
  return `translate(${x} ${y}) translate(${PUPIL_CENTER.x} ${PUPIL_CENTER.y}) rotate(${rotate}) scale(${scale}) translate(${-PUPIL_CENTER.x} ${-PUPIL_CENTER.y})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CanopyLogo({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const logoFrameRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const pupilClipId = useId();
  const [isActive, setIsActive] = useState(false);
  const [isInverted, setIsInverted] = useState(false);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const pupilX = useSpring(targetX, { stiffness: 145, damping: 19, mass: 0.7 });
  const pupilY = useSpring(targetY, { stiffness: 145, damping: 19, mass: 0.7 });
  const pupilRotate = useMotionValue(0);
  const pupilScale = useMotionValue(1);
  const [pupilTransform, setPupilTransform] = useState(() =>
    getPupilTransform(0, 0, 0, 1),
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      pupilRotate.set(0);
      pupilScale.set(1);
      return;
    }

    const rotateControls = animate(pupilRotate, isActive ? 35 : 360, {
      duration: isActive ? 0.45 : 8,
      ease: isActive ? [0.22, 1, 0.36, 1] : "linear",
      repeat: isActive ? 0 : Infinity,
    });
    const scaleControls = animate(pupilScale, isActive ? 1.25 : [0.92, 1.12, 0.92], {
      duration: isActive ? 0.35 : 4.8,
      ease: isActive ? [0.22, 1, 0.36, 1] : "easeInOut",
      repeat: isActive ? 0 : Infinity,
    });

    return () => {
      rotateControls.stop();
      scaleControls.stop();
    };
  }, [isActive, prefersReducedMotion, pupilRotate, pupilScale]);

  useEffect(() => {
    if (prefersReducedMotion || isActive) {
      return;
    }

    const driftX = animate(targetX, [0, 4, -3, 0], {
      duration: 5.8,
      ease: "easeInOut",
      repeat: Infinity,
    });
    const driftY = animate(targetY, [0, -2.2, 2, 0], {
      duration: 6.4,
      ease: "easeInOut",
      repeat: Infinity,
    });

    return () => {
      driftX.stop();
      driftY.stop();
    };
  }, [isActive, prefersReducedMotion, targetX, targetY]);

  useEffect(() => {
    const updateTransform = () => {
      setPupilTransform(
        getPupilTransform(pupilX.get(), pupilY.get(), pupilRotate.get(), pupilScale.get()),
      );
    };
    const unsubscribers = [
      pupilX.on("change", updateTransform),
      pupilY.on("change", updateTransform),
      pupilRotate.on("change", updateTransform),
      pupilScale.on("change", updateTransform),
    ];

    updateTransform();

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [pupilRotate, pupilScale, pupilX, pupilY]);

  useEffect(() => {
    document.documentElement.classList.toggle("canopy-inverted", isInverted);

    return () => {
      document.documentElement.classList.remove("canopy-inverted");
    };
  }, [isInverted]);

  function updatePupilTarget(clientX: number, clientY: number) {
    const bounds = logoFrameRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    setIsActive(true);

    const centerX = bounds.left + (PUPIL_CENTER.x / LOGO_VIEWBOX.width) * bounds.width;
    const centerY = bounds.top + (PUPIL_CENTER.y / LOGO_VIEWBOX.height) * bounds.height;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    const shift = Math.min(distance / 14, MAX_PUPIL_SHIFT);
    const svgUnitsPerPixel = LOGO_VIEWBOX.width / bounds.width;
    const rawX = (deltaX / distance) * shift * svgUnitsPerPixel;
    const rawY = (deltaY / distance) * shift * svgUnitsPerPixel;

    targetX.set(clamp(rawX, -PUPIL_LIMIT.x, PUPIL_LIMIT.x));
    targetY.set(clamp(rawY, -PUPIL_LIMIT.y, PUPIL_LIMIT.y));
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    updatePupilTarget(event.clientX, event.clientY);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    updatePupilTarget(event.clientX, event.clientY);
  }

  function resetPupil() {
    setIsActive(false);
    targetX.set(0);
    targetY.set(0);
  }

  function toggleInversion() {
    setIsInverted((inverted) => !inverted);
  }

  return (
    <div
      className={`canopy-logo-shell flex select-none flex-col items-center bg-transparent ${className ?? "w-[min(82vw,560px)] sm:w-[min(46vw,620px)]"}`}
      onMouseLeave={resetPupil}
      onMouseMove={handleMouseMove}
      onPointerLeave={resetPupil}
      onPointerMove={handlePointerMove}
    >
      <button
        ref={logoFrameRef}
        type="button"
        aria-label={isInverted ? "Return CANOPY to light mode" : "Invert CANOPY colors"}
        aria-pressed={isInverted}
        className="canopy-logo-button relative w-full cursor-pointer bg-transparent p-0 outline-none"
        onClick={toggleInversion}
      >
        <svg
          aria-label="CANOPY"
          className="canopy-logo-svg block h-auto w-full"
          role="img"
          viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={pupilClipId}>
              <ellipse cx={EYE_MASK.cx} cy={EYE_MASK.cy} rx={EYE_MASK.rx} ry={EYE_MASK.ry} />
            </clipPath>
          </defs>
          <image
            className="canopy-logo-image"
            height={LOGO_VIEWBOX.height}
            href="/canopy-logo.svg"
            preserveAspectRatio="xMidYMid meet"
            width={LOGO_VIEWBOX.width}
            x="0"
            y="0"
          />
          <g clipPath={`url(#${pupilClipId})`}>
            <motion.path
              className="canopy-pupil"
              data-canopy-pupil="true"
              d={STAR_PATH}
              initial={false}
              transform={pupilTransform}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </g>
        </svg>
      </button>
      {children}
    </div>
  );
}
