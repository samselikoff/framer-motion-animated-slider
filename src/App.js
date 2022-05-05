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
  let constraintsRef = useRef();
  let handleSize = 20;
  let scaledHandleSize = 60;
  let handleX = useMotionValue(0);
  let dragControls = useDragControls();
  let fullBarRef = useRef();
  let fullBarBounds = useBounds(fullBarRef);
  let fullBarWidth = fullBarBounds?.width;
  let progressWidth = useTransform(handleX, (v) => v + handleSize / 2);

  function handleDrag() {
    let handleBounds = handleRef.current.getBoundingClientRect();
    let middleOfHandle = handleBounds.x + handleBounds.width / 2;

    let newProgress =
      (middleOfHandle -
        (fullBarRef.current.getBoundingClientRect().x + handleSize / 2)) /
      (fullBarWidth - handleSize);

    onChange(newProgress * (max - min));
  }

  // useLayoutEffect(() => {
  //   let handleWidth = handleRef.current.clientWidth;
  //   let newProgress = value / (max - min);

  //   handleX.set(newProgress * (fullBarWidth - handleWidth));
  // }, [value, handleX, max, min, fullBarWidth]);

  return (
    <div data-test="slider" className="relative flex items-center">
      <div
        data-test="slider-constraints"
        ref={constraintsRef}
        className=" absolute inset-x-0 h-0.5 rounded-full"
      />

      <div
        className="absolute inset-x-0 flex items-center"
        // style={{ left: handleSize / 2, right: handleSize / 2 }}
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

        <motion.div
          data-test="slider-current-progress"
          className="absolute h-0.5 rounded-full bg-gray-700 pointer-events-none"
          style={{ left: 0, width: progressWidth }}
        />
      </div>

      <motion.div
        data-test="slider-handle"
        ref={handleRef}
        // drag="x"
        // whileDrag={{ scale: 1 }}
        // dragConstraints={constraintsRef}
        // dragControls={dragControls}
        // dragElastic={0}
        // dragMomentum={false}
        // onDrag={handleDrag}
        className="relative bg-red-500 rounded-full opacity-50 cursor-grab active:cursor-grabbing"
        // transition={{ type: "tween", duration: 0.15 }}
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

// function getProgressFromX({ x, containerRef }) {
//   let bounds = containerRef.current.getBoundingClientRect();
//   let progress = (x - bounds.x) / bounds.width;

//   return progress;
// }
