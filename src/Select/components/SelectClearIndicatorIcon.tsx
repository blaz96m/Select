type SelectClearIndicatorIconProps = {
  height: number;
};

const SelectClearIndicatorIcon = ({
  height,
}: SelectClearIndicatorIconProps) => {
  return (
    <div className="icon__container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={height}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
};

export default SelectClearIndicatorIcon;
