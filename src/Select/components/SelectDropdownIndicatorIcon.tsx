type SelectDropdownIndicatorIconProps = {
  isOpen: boolean;
};

export const SelectDropdownIndicatorIcon = ({
  isOpen,
}: SelectDropdownIndicatorIconProps) => {
  return (
    <div className="icon__container">
      {!isOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          height={25}
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={25}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 15.75 7.5-7.5 7.5 7.5"
          />
        </svg>
      )}
    </div>
  );
};

export default SelectDropdownIndicatorIcon;
