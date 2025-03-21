import { useCallback, useEffect, useRef } from "react";
import { isFunction } from "lodash-es";
import { RefObject } from "react";
import {
  isScrolledToTheStart,
  isScrolledToEnd,
  isScrollingDown,
  isScrollingUp,
} from "src/general/utils/dom";

type ScrollAction = {
  handler: (...args: any) => void;
  prevent?: boolean | ((scrollEvent?: WheelEvent) => boolean);
};

type ScrollActions = {
  onArrive?: ScrollAction;
  onLeave?: ScrollAction;
};

const INIFNITE_SCROLL_THROTTLE_AMOUNT = 350;

const shouldCancelScrollAction = (
  action: ScrollAction,
  scrollEvent: WheelEvent
) => {
  const { prevent } = action;
  return isFunction(prevent) ? prevent(scrollEvent) : prevent;
};

const useScrollManager = <T extends HTMLElement>(
  targetRef: RefObject<T>,
  bottomActions: ScrollActions = { onArrive: undefined, onLeave: undefined },
  topActions: ScrollActions = { onArrive: undefined, onLeave: undefined },
  preventScroll?: boolean,
  captureEnabled = true
) => {
  const lastScrollTimeRef = useRef(0);
  const handleScrollActionApply = (
    e: WheelEvent,
    action: ScrollAction,
    throttleAfterActionExecution = true
  ) => {
    // THROTTLE AFTER INFINITE SCROLL LOAD
    if (shouldCancelScrollAction(action, e)) {
      return;
    }

    const now = Date.now();
    if (throttleAfterActionExecution) {
      if (now - lastScrollTimeRef.current < INIFNITE_SCROLL_THROTTLE_AMOUNT) {
        return e.preventDefault();
      }
      lastScrollTimeRef.current = now;
    }

    if (isFunction(action?.handler)) {
      action.handler();
      e.preventDefault();
    }
  };

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
      if (isScrolledToBottom && userScrollingDown && bottomActions.onArrive) {
        handleScrollActionApply(
          scrollEvent,
          bottomActions.onArrive,
          throttleAfterActionExecution
        );
      }

      if (isScrolledToBottom && userScrollingUp && bottomActions.onLeave) {
        handleScrollActionApply(
          scrollEvent,
          bottomActions.onLeave,
          throttleAfterActionExecution
        );
      }

      if (isScrolledToTop && userScrollingUp && topActions.onArrive) {
        handleScrollActionApply(
          scrollEvent,
          topActions.onArrive,
          throttleAfterActionExecution
        );
      }

      if (isScrolledToTop && userScrollingDown && topActions.onLeave) {
        handleScrollActionApply(
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
