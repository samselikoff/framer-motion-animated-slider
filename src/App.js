import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function App() {
  let [progress, setProgress] = useState(100);
  let min = 0;
  let max = 200;

  return (
    <div className="p-8 w-80">
      <div className="flex justify-between mb-4">
        <span className="border-l border-green-500">{min}</span>
        <span className="border-r border-green-500">{max}</span>
      </div>

      <Slider min={min} max={max} value={progress} onChange={setProgress} />

      <div className="mt-8">
        <p>Current: {Math.floor(progress * 10) / 10}</p>
      </div>
      <div>
        <button onClick={() => setProgress(50)}>Set to 50</button>
      </div>
    </div>
  );
}

/*
  Details / requirements:
    - Can add padding to handle without breaking calculations
    - Constraints work
    - Drag controls work
    - Can go from clicking on drag controls to dragging
    - While dragging handle, can move cursor down/up off the handle element
    - Resilient to resize?
*/
function Slider({ min, max, value, onChange }) {
  let constraintsRef = useRef();
  let fullBarRef = useRef();
  let buttonSize = 10;
  let scrubberX = useMotionValue();
  let dragControls = useDragControls();

  function handleDrag(event) {
    let { left, width } = fullBarRef.current.getBoundingClientRect();
    let position = event.pageX - left;
    let newProgress = clamp(position, 0, width) / width;
    onChange(newProgress * (max - min));
  }

  useEffect(() => {
    let { width } = fullBarRef.current.getBoundingClientRect();
    let newProgress = value / (max - min);
    let newX = newProgress * width;
    if (scrubberX.get() !== newX) {
      scrubberX.set(newProgress * width);
    }
  }, [value, scrubberX, max, min]);

  return (
    <div
      data-test="slider"
      className="relative flex items-center"
      style={{ marginLeft: -buttonSize / 2, marginRight: -buttonSize / 2 }}
    >
      <div
        data-test="slider-constraints"
        ref={constraintsRef}
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
            let newProgress = clamp(position, 0, width) / width;
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

      {/* <div className="absolute inset-0 flex items-center h-0.5"> */}
      <motion.button
        data-test="slider-scrubber"
        drag="x"
        whileDrag={{ scale: 2 }}
        dragConstraints={constraintsRef}
        dragControls={dragControls}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleDrag}
        className="absolute bg-red-500 rounded-full cursor-grab active:cursor-grabbing"
        style={{
          x: scrubberX,
          top: -buttonSize / 2,
          width: buttonSize,
          height: buttonSize,
        }}
      />
      {/* </div> */}
    </div>
  );
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

// function getProgressFrom
