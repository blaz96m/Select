import { useCallback, useEffect, useRef } from "react";
import { isFunction } from "lodash";
import { RefObject } from "react";
import {
  isScrolledToTheStart,
  isScrolledToEnd,
  isScrollingDown,
  isScrollingUp,
} from "src/general/utils/dom";

type ScrollAction = {
  handler: (...args: any) => void;
  prevent?: boolean;
};

type ScrollActions = {
  onArrive?: ScrollAction;
  onLeave?: ScrollAction;
};

const INIFNITE_SCROLL_THROTTLE_AMOUNT = 350;

const useScrollManager = <T extends HTMLElement>(
  targetRef: RefObject<T>,
  bottomActions: ScrollActions = { onArrive: undefined, onLeave: undefined },
  topActions: ScrollActions = { onArrive: undefined, onLeave: undefined },
  preventScroll?: boolean,
  captureEnabled = true
) => {
  const applyAction = (
    e: WheelEvent,
    action?: ScrollAction,
    throttleAfterActionExecution = true
  ) => {
    // THROTTLE AFTER INFINITE SCROLL LOAD
    if (action?.prevent) {
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
    }
    if (isFunction(action?.handler)) {
      action.handler();
      e.preventDefault();
    }
  };

  const lastScrollTimeRef = useRef(0);
  const handleScroll = useCallback(
    (scrollEvent: WheelEvent, throttleAfterActionExecution = true) => {
      const target = targetRef.current;
      if (!target || !captureEnabled || preventScroll) {
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
      bottomActions.onArrive?.handler,
      bottomActions.onArrive?.prevent,
      bottomActions.onLeave?.handler,
      bottomActions.onLeave?.prevent,
      topActions.onArrive?.handler,
      topActions.onArrive?.prevent,
      topActions.onLeave?.handler,
      topActions.onLeave?.prevent,
      captureEnabled,
      preventScroll,
    ]
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
