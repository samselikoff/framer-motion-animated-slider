import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function App() {
  let min = 0;
  let max = 100;
  let [value, setValue] = useState(30);
  let percent = value / (max - min);

  let [dragging, setDragging] = useState(false);
  let constraintsRef = useRef();
  let handleRef = useRef();
  let progressBarRef = useRef();
  let handleSize = 40;
  let handleX = useMotionValue(0);
  let progress = useTransform(handleX, (v) => v + handleSize / 2);
  let background = useMotionTemplate`linear-gradient(90deg, #374151 ${progress}px, #d1d5db 0)`;

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

    handleX.set(newProgress * progressBarBounds.width);
  }, [handleX, max, min, value]);

  return (
    <div className="max-w-xl p-8 mx-auto">
      <div data-test="slider" className="relative flex flex-col justify-center">
        <motion.div
          data-test="slider-background"
          className="absolute w-full h-3 rounded-full"
          style={{ background }}
        />

        <div
          data-test="slider-progress"
          ref={progressBarRef}
          className="absolute h-2"
          style={{
            left: handleSize / 2,
            right: handleSize / 2,
          }}
        />

        <div ref={constraintsRef}>
          <motion.div
            data-test="slider-handle"
            ref={handleRef}
            className="relative z-10 bg-red-500 rounded-full"
            drag="x"
            dragMomentum={false}
            dragConstraints={constraintsRef}
            dragElastic={0}
            onDrag={handleDrag}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
            onPointerDown={() => setDragging(true)}
            onPointerUp={() => setDragging(false)}
            animate={{
              scale: dragging ? 2 : 1,
            }}
            style={{
              width: handleSize,
              height: handleSize,
              x: handleX,
            }}
          />
        </div>

        <div
          data-test="slider-clickable-area"
          className="absolute w-full h-4"
          onPointerDown={(event) => {
            let { left, width } =
              progressBarRef.current.getBoundingClientRect();
            let position = event.pageX - left;
            let newProgress = clamp(position / width, 0, 1);
            let newValue = newProgress * (max - min);
            setValue(newValue, min, max);
            animate(handleX, newProgress * width);
          }}
        />
      </div>

      <motion.div
        className="text-xl"
        animate={{ y: dragging && percent < 0.15 ? 20 : 0 }}
      >
        {Math.floor(value * 100) / 100}
      </motion.div>
    </div>
  );
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
