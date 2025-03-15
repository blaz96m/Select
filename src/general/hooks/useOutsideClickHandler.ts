import { RefObject, useEffect } from "react";

const useOutsideClickHandler = <T extends HTMLElement>(
  ref: RefObject<T>,
  callback: (e: MouseEvent, ...args: any) => void,
  isDisabled: boolean
) => {
  useEffect(() => {
    if (!isDisabled) {
      const handleOutsideClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          callback(e);
        }
      };
      if (ref.current) {
        document.addEventListener("click", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [callback, isDisabled]);

  return ref;
};

export default useOutsideClickHandler;
