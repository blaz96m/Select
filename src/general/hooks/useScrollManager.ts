import { useCallback, useEffect, useRef } from "react";
import { isFunction, noop } from "lodash";
import { RefObject } from "react";
import {
  isScrolledToTheStart,
  isScrolledToEnd,
  isScrollingDown,
  isScrollingUp,
} from "src/general/utils/dom";
import { useThrottle } from "src/general/hooks";

type ScrollActions = {
  onArrive?: ((...args: any) => void) | null;
  onLeave?: ((...args: any) => void) | null;
};

const INIFNITE_SCROLL_THROTTLE_AMOUNT = 350;

const useScrollManager = <T extends HTMLElement>(
  targetRef: RefObject<T>,
  bottomActions: ScrollActions = { onArrive: null, onLeave: null },
  topActions: ScrollActions = { onArrive: null, onLeave: null },
  preventScroll?: boolean,
  captureEnabled = true
) => {
  const applyAction = (
    e: WheelEvent,
    action?: (() => void) | null,
    throttleAfterActionExecution = true
  ) => {
    // THROTTLE AFTER INFINITE SCROLL LOAD
    const now = Date.now();
    if (throttleAfterActionExecution) {
      if (
        now - lastScrollTimeRef.current < INIFNITE_SCROLL_THROTTLE_AMOUNT &&
        throttleAfterActionExecution
      ) {
        return e.preventDefault();
      }
      lastScrollTimeRef.current = Date.now();
    }
    if (isFunction(action)) {
      action();
      e.preventDefault();
    }
  };

  const lastScrollTimeRef = useRef(0);
  const handleScroll = useCallback(
    (scrollEvent: WheelEvent, throttleAfterActionExecution = true) => {
      const target = targetRef.current;
      if (!target || !captureEnabled || preventScroll) {
        scrollEvent.preventDefault();
        return;
      }
      const isScrolledToBottom = isScrolledToEnd(targetRef);
      const isScrolledToTop = isScrolledToTheStart(targetRef);

      const userScrollingUp = isScrollingUp(scrollEvent);
      const userScrollingDown = isScrollingDown(scrollEvent);
      if (isScrolledToBottom && userScrollingDown) {
        applyAction(
          scrollEvent,
          bottomActions.onArrive,
          throttleAfterActionExecution
        );
      }

      if (isScrolledToBottom && userScrollingUp) {
        applyAction(
          scrollEvent,
          bottomActions.onLeave,
          throttleAfterActionExecution
        );
      }

      if (isScrolledToTop && userScrollingUp) {
        applyAction(
          scrollEvent,
          topActions.onArrive,
          throttleAfterActionExecution
        );
      }

      if (isScrolledToTop && userScrollingDown) {
        applyAction(
          scrollEvent,
          topActions.onLeave,
          throttleAfterActionExecution
        );
      }
    },
    [
      bottomActions.onArrive,
      bottomActions.onLeave,
      topActions.onArrive,
      topActions.onLeave,
      captureEnabled,
      preventScroll,
    ]
  );

  const disableScroll = (e: WheelEvent) => e.preventDefault();

  const throttledScrollHandler = useThrottle((e: WheelEvent) =>
    handleScroll(e)
  );

  useEffect(() => {
    if (captureEnabled && targetRef.current) {
      const target = targetRef.current;

      target.addEventListener("wheel", handleScroll);

      return () => {
        target.removeEventListener("wheel", handleScroll);
      };
    }
  }, [captureEnabled, handleScroll]);
};

export default useScrollManager;
