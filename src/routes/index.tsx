import React from "react";

export function Page() {
  const [value, setValue] = React.useState(0);

  return (
    <div className="flex flex-col gap-2 py-8 mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        Counter = {value}
        <div className="flex gap-2">
          <button
            className="antd-btn antd-btn-default px-2"
            onClick={() => setValue((v) => v - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-2"
            onClick={() => setValue((v) => v + 1)}
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
