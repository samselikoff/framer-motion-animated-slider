import {
  motion,
  useDragControls,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
// import useSize from "@react-hook/size";
import useResizeObserver from "@react-hook/resize-observer";

import useMeasure from "react-use-measure";
import clamp from "../utils/clamp";

let useBounds = (target) => {
  let [bounds, setBounds] = useState();

  useLayoutEffect(() => {
    setBounds(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => {
    // console.log(entry);
    setBounds(target.current.getBoundingClientRect());
  });

  return bounds;
};

export default function App() {
  let [one, setOne] = useState(0);
  let [two, setTwo] = useState(30);

  return (
    <div>
      <div className="px-8 mt-10">
        <Slider min={0} max={10} value={one} onChange={setOne} />
        <p>{one}</p>
        <Slider min={0} max={100} value={two} onChange={setTwo} />
        <p>{two}</p>
      </div>
    </div>
  );
}

function Slider({ min, max, value, onChange }) {
  let handleRef = useRef();
  let constraintsRef = useRef();
  let progressBarRef = useRef();
  let handleSize = 20;
  let scaledHandleSize = 30;
  let handleX = useMotionValue(-(scaledHandleSize - handleSize) / 2);
  let dragControls = useDragControls();
  let progressWidth = useTransform(handleX, (v) => v + scaledHandleSize / 2);

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
    let newX = middleOfHandle - (scaledHandleSize - handleSize) / 2;

    handleX.set(newX);
  }, [handleSize, handleX, max, min, scaledHandleSize, value]);

  return (
    <div
      data-test="slider"
      className="relative flex items-center"
      style={{ height: handleSize }}
    >
      <div
        data-test="slider-constraints"
        ref={constraintsRef}
        className="absolute h-0.5 rounded-full"
        style={{
          left: -((scaledHandleSize - handleSize) / 2),
          right: -((scaledHandleSize - handleSize) / 2),
        }}
      />

      <div className="absolute inset-x-0 flex items-center">
        <div
          data-test="slider-background"
          className="absolute inset-x-0 flex items-center py-1 cursor-grab"
          onPointerDown={(event) => {
            let { left, width } =
              progressBarRef.current.getBoundingClientRect();
            let position = event.pageX - left;
            let newProgress = position / width;
            let newValue = newProgress * (max - min);
            onChange(clamp(newValue, min, max));
          }}
        >
          <div className="w-full h-0.5 bg-gray-300 rounded-full" />
        </div>

        <motion.div
          data-test="slider-filled-background"
          className="absolute h-0.5 rounded-full bg-gray-700 pointer-events-none"
          style={{ width: progressWidth }}
        />
      </div>

      <div
        data-test="slider-progress"
        ref={progressBarRef}
        className="absolute pointer-events-none"
        style={{ left: handleSize / 2, right: handleSize / 2 }}
      ></div>

      <motion.div
        data-test="slider-handle"
        ref={handleRef}
        drag="x"
        whileDrag={{ scale: 1 }}
        dragConstraints={constraintsRef}
        dragControls={dragControls}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleDrag}
        transition={{ type: "tween", duration: 0.15 }}
        className="absolute bg-red-500 rounded-full opacity-50 cursor-grab active:cursor-grabbing"
        style={{
          x: handleX,
          width: scaledHandleSize,
          height: scaledHandleSize,
          scale: handleSize / scaledHandleSize,
        }}
      >
        <div></div>
      </motion.div>
    </div>
  );
}
