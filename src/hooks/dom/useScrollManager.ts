import { useCallback, useEffect } from "react";
import { isFunction, noop } from "lodash";
import { RefObject } from "react";
import {
  isScrolledToTheStart,
  isScrolledToEnd,
  isScrollingDown,
  isScrollingUp,
} from "src/utils/dom";
import useThrottle from "../general/useThrottle";

type ScrollActions = {
  onArrive?: (...args: any) => void;
  onLeave?: (...args: any) => void;
};

const useScrollManager = <T extends HTMLElement>(
  targetRef: RefObject<T>,
  bottomActions: ScrollActions = { onArrive: noop, onLeave: noop },
  topActions: ScrollActions = { onArrive: noop, onLeave: noop },
  captureEnabled = true
) => {
  const applyAction = (e: WheelEvent, action?: () => void) => {
    isFunction(action) && action();
    e.preventDefault();
  };
  const handleScroll = useCallback(
    (scrollEvent: WheelEvent) => {
      console.log(targetRef.current);
      if (!targetRef.current) return;
      const isScrolledToBottom = isScrolledToEnd(targetRef);
      const isScrolledToTop = isScrolledToTheStart(targetRef);

      const userScrollingUp = isScrollingUp(scrollEvent);
      const userScrollingDown = isScrollingDown(scrollEvent);
      if (isScrolledToBottom && userScrollingDown) {
        applyAction(scrollEvent, bottomActions.onArrive);
      }

      if (isScrolledToBottom && userScrollingUp) {
        applyAction(scrollEvent, bottomActions.onLeave);
      }

      if (isScrolledToTop && userScrollingUp) {
        applyAction(scrollEvent, topActions.onArrive);
      }

      if (isScrolledToTop && userScrollingDown) {
        applyAction(scrollEvent, topActions.onLeave);
      }
    },
    [
      bottomActions.onArrive,
      bottomActions.onLeave,
      topActions.onArrive,
      topActions.onLeave,
    ]
  );

  const throttledScrollHandler = useThrottle((e: WheelEvent) =>
    handleScroll(e)
  );

  useEffect(() => {
    if (!captureEnabled || !targetRef.current) return noop;
    const target = targetRef.current;

    target.addEventListener("wheel", throttledScrollHandler);

    return () => {
      target.removeEventListener("wheel", throttledScrollHandler);
    };
  }, [captureEnabled, handleScroll]);
};

export default useScrollManager;
