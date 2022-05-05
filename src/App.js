import {
  motion,
  useDragControls,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function App() {
  let [one, setOne] = useState(0);
  let [two, setTwo] = useState(30);

  // useInterval(() => {
  //   setOne((one) => one + 0.01);
  //   setTwo((two) => two + 0.01);
  // }, 10);

  return (
    <div>
      <div className="px-8 mt-10">
        {/* <Slider min={0} max={10} value={one} onChange={setOne} />
        <p>{Math.floor(one)}</p> */}
        <Slider min={0} max={100} value={two} onChange={setTwo} />
        <p>{Math.floor(two)}</p>
      </div>
    </div>
  );
}

function Slider({ min, max, value, onChange }) {
  let handleRef = useRef();
  let progressBarRef = useRef();
  let constraintsRef = useRef();
  let dragControls = useDragControls();
  let handleSize = 20;
  let handleOverflow = 0;
  let handleX = useMotionValue(0);
  let progressWidth = useTransform(handleX, (v) => v + handleSize / 2);
  let background = useMotionTemplate`linear-gradient(90deg, #374151 ${progressWidth}px, #d1d5db 0)`;

  function handleDrag() {
    let handleBounds = handleRef.current.getBoundingClientRect();
    let middleOfHandle = handleBounds.x + handleBounds.width / 2;
    let progressBarBounds = progressBarRef.current.getBoundingClientRect();
    let newProgress =
      (middleOfHandle - progressBarBounds.x) / progressBarBounds.width;

    onChange(newProgress * (max - min));
  }

  useEffect(() => {
    let newProgress = value / (max - min);
    let progressBarBounds = progressBarRef.current.getBoundingClientRect();
    let middleOfHandle = newProgress * progressBarBounds.width;
    let newX = middleOfHandle;

    handleX.set(newX);
  }, [handleX, max, min, value]);

  return (
    <div
      data-test="slider"
      className="relative flex flex-col justify-center w-full"
    >
      <motion.div
        data-test="slider-background"
        className="absolute inset-x-0 h-2 rounded-full"
        style={{ background }}
        // style={{
        //   background: `linear-gradient(90deg, #374151 calc(${
        //     (value / (max - min)) * 100
        //   }% + 5px), #d1d5db 0)`,
        // }}
        // style={{
        //   background: `linear-gradient(90deg, #374151 calc(${
        //     (value / (max - min)) * 100
        //   }% + 5px), #d1d5db 0)`,
        // }}
      />

      <div
        data-test="slider-actual-progress"
        ref={progressBarRef}
        className="absolute h-1 pointer-events-none"
        style={{
          left: handleSize / 2 - handleOverflow,
          right: handleSize / 2 - handleOverflow,
        }}
      />

      <div
        style={{ marginLeft: -handleOverflow, marginRight: -handleOverflow }}
        className="flex"
        ref={constraintsRef}
      >
        <motion.div
          data-test="slider-handle"
          ref={handleRef}
          drag="x"
          dragConstraints={constraintsRef}
          dragControls={dragControls}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          transition={{ type: "tween", duration: 0.15 }}
          className="relative z-10 bg-red-500 rounded-full opacity-50 cursor-grab active:cursor-grabbing"
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
          let { left, width } = progressBarRef.current.getBoundingClientRect();
          let position = event.pageX - left;
          let newProgress = position / width;
          let newValue = newProgress * (max - min);
          onChange(clamp(newValue, min, max));
        }}
      ></div>
    </div>
  );
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
function useInterval(callback, delay) {
  const intervalRef = useRef(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);
  return intervalRef;
}
