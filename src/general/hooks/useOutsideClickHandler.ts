import { RefObject, useEffect } from "react";

const useOutsideClickHandler = <T extends HTMLElement>(
  ref: RefObject<T>,
  callback: (e: MouseEvent, ...args: any) => void
) => {
  useEffect(() => {
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
  }, [callback]);

  return ref;
};

export default useOutsideClickHandler;
