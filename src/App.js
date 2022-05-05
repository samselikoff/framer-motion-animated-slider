import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
// import useSize from "@react-hook/size";
import useResizeObserver from "@react-hook/resize-observer";

import useMeasure from "react-use-measure";

let useBounds = (target) => {
  let [size, setSize] = useState();

  useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
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

  // let [progress, setProgress] = useState(100);
  // let min = 0;
  // let max = 400;

  // return (
  //   <div className="p-2 bg-blue-100 h-[400px] overflow-y-scroll">
  //     <div className="w-full px-8 py-8">
  //       <div className="flex justify-between mb-4">
  //         <span className="border-l border-green-500">{min}</span>
  //         <span className="border-r border-green-500">{max}</span>
  //       </div>
  //       <Slider min={min} max={max} value={progress} onChange={setProgress} />
  //       <div className="mt-8">
  //         <p>Current: {Math.floor(progress * 10) / 10}</p>
  //       </div>
  //       <div>
  //         <button onClick={() => setProgress(50)}>Set to 50</button>
  //       </div>
  //     </div>
  //   </div>
  // );
}

function Slider({ min, max, value, onChange }) {
  let handleRef = useRef();
  let buttonSize = 60;
  let handleX = useMotionValue();
  let dragControls = useDragControls();
  // let [fullBarRef, fullBarBounds] = useMeasure();
  let fullBarRef = useRef();
  let fullBarBounds = useBounds(fullBarRef);
  let handleBounds = useBounds(handleRef);
  let fullBarWidth = fullBarBounds?.width;

  function handleDrag() {
    // Old
    // let { left, width } = fullBarRef.current.getBoundingClientRect();
    // let position = event.pageX - left;
    // let newProgress = clamp(position, 0, width) / width;
    // onChange(newProgress * (max - min));

    // New
    let handleBounds = handleRef.current.getBoundingClientRect();
    // console.log({ handleBounds });
    let middleOfHandle = handleBounds.x + handleBounds.width / 2;
    // console.log({ middleOfHandle });
    // let newProgress = getProgressFromX({
    //   containerRef: fullBarRef,
    //   x: middleOfHandle,
    // });

    let newProgress = (middleOfHandle - 0) / fullBarWidth;

    onChange(newProgress * (max - min));
  }

  useLayoutEffect(() => {
    let newProgress = value / (max - min);
    let newX = newProgress * fullBarWidth;

    if (handleX.get() !== newX) {
      handleX.set(newProgress * fullBarWidth);
    }
  }, [value, handleX, max, min, fullBarWidth]);

  return (
    <div
      data-test="slider"
      className="relative flex items-center"
      style={{ marginLeft: -buttonSize / 2, marginRight: -buttonSize / 2 }}
    >
      <div
        data-test="slider-constraints"
        className="absolute inset-x-0 h-0.5 rounded-full"
      />

      <div
        className="absolute flex items-center"
        style={{ left: buttonSize / 2, right: buttonSize / 2 }}
      >
        <div
          data-test="slider-background"
          ref={fullBarRef}
          className="absolute inset-x-0 flex items-center py-1 cursor-grab"
          onPointerDown={(event) => {
            dragControls.start(event, { snapToCursor: true });
            let { left, width } = fullBarRef.current.getBoundingClientRect();
            let position = event.pageX - left;
            let newProgress = position / width;
            onChange(newProgress * (max - min));
          }}
        >
          <div className="w-full h-0.5 bg-gray-300 rounded-full" />
        </div>

        <div
          data-test="slider-current-progress"
          className="absolute h-0.5 rounded-full bg-gray-700 pointer-events-none"
          style={{ width: `${(value / (max - min)) * 100}%` }}
        />
      </div>

      <motion.button
        data-test="slider-handle"
        ref={handleRef}
        drag="x"
        whileDrag={{ scale: 1 }}
        dragConstraints={{ left: 0, right: fullBarWidth }}
        dragControls={dragControls}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleDrag}
        className="bg-red-500 rounded-full opacity-50 cursor-grab active:cursor-grabbing"
        style={{
          x: handleX,
          width: buttonSize,
          height: buttonSize,
          scale: 0.5,
        }}
      />
    </div>
  );
}

function getProgressFromX({ x, containerRef }) {
  let bounds = containerRef.current.getBoundingClientRect();
  let progress = (x - bounds.x) / bounds.width;

  return progress;
}
