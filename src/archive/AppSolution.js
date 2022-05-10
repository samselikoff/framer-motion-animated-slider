import {
  motion,
  useDragControls,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import clamp from "../utils/clamp";

export default function App() {
  let min = 0;
  let max = 100;
  let [value, setValue] = useState(30);
  let [dragging, setDragging] = useState(false);
  let progress = value / (max - min);

  let handleRef = useRef();
  let progressBarRef = useRef();
  let constraintsRef = useRef();
  let dragControls = useDragControls();
  let handleSize = 40;

  let handleX = useMotionValue(0);
  let progressWidth = useTransform(handleX, (v) => v + handleSize / 2);
  let background = useMotionTemplate`linear-gradient(90deg, #374151 ${progressWidth}px, #d1d5db 0)`;

  function handleDrag() {
    let handleBounds = handleRef.current.getBoundingClientRect();
    let middleOfHandle = handleBounds.x + handleBounds.width / 2;
    let progressBarBounds = progressBarRef.current.getBoundingClientRect();
    let newProgress =
      (middleOfHandle - progressBarBounds.x) / progressBarBounds.width;

    setValue(newProgress * (max - min));
  }

  useEffect(() => {
    let newProgress = value / (max - min);
    let progressBarBounds = progressBarRef.current.getBoundingClientRect();
    let middleOfHandle = newProgress * progressBarBounds.width;
    let newX = middleOfHandle;

    handleX.set(newX);
  }, [handleX, max, min, value]);

  return (
    <div className="p-8">
      <div
        data-test="slider"
        className="relative flex flex-col justify-center w-full"
      >
        <motion.div
          data-test="slider-background"
          className="absolute inset-x-0 h-6 rounded-full"
          style={{ background }}
        />
        <div
          data-test="slider-actual-progress"
          ref={progressBarRef}
          className="absolute h-1 pointer-events-none"
          style={{
            left: handleSize / 2,
            right: handleSize / 2,
          }}
        />
        <div ref={constraintsRef}>
          <motion.div
            data-test="slider-handle"
            ref={handleRef}
            drag="x"
            dragConstraints={constraintsRef}
            dragControls={dragControls}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
            onPointerDown={() => setDragging(true)}
            onPointerUp={() => setDragging(false)}
            animate={{ scale: dragging ? 2 : 1 }}
            transition={{ type: "tween", duration: 0.15 }}
            className="relative z-10 bg-red-500 rounded-full cursor-grab active:cursor-grabbing"
            style={{
              x: handleX,
              width: handleSize,
              height: handleSize,
            }}
          />
        </div>
        <div
          data-test="slider-clickable-area"
          className="absolute z-0 w-full py-2 cursor-grab"
          onPointerDown={(event) => {
            let { left, width } =
              progressBarRef.current.getBoundingClientRect();
            let position = event.pageX - left;
            let newProgress = position / width;
            let newValue = newProgress * (max - min);
            setValue(clamp(newValue, min, max));
          }}
        />
      </div>
      <div className="mt-2">
        <motion.p
          animate={{ y: dragging && progress < 0.1 ? 30 : 0 }}
          className="text-2xl"
        >
          {Math.floor(value * 100) / 100}
        </motion.p>
      </div>
    </div>
  );
}
