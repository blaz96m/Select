import { RefObject } from "react";

export const isScrolledToTheStart = (
  el: RefObject<HTMLElement>,
  isHorizontal = true
): boolean => {
  if (!el.current) {
    return false;
  }
  const target = el.current;
  const scrollStartValue = isHorizontal ? target.scrollTop : target.scrollLeft;
  return scrollStartValue === 0;
};

export const isScrolledToEnd = (
  el: RefObject<HTMLElement>,
  isHorizontal = true
): boolean => {
  if (!el.current) {
    return false;
  }
  const target = el.current;
  const remainingScrollSpace = getRemainingScrollSpace(target, isHorizontal);
  return remainingScrollSpace <= 1;
};

export const getRemainingScrollSpace = (
  el: HTMLElement,
  isHorizontal = true
): number => {
  if (isHorizontal) {
    const { scrollTop, clientHeight, scrollHeight } = el;
    return scrollHeight - clientHeight - scrollTop;
  }
  const { scrollLeft, clientWidth, scrollWidth } = el;
  return scrollWidth - clientWidth - scrollLeft;
};

export const isScrollingUp = (scrollEvent: WheelEvent): boolean => {
  return scrollEvent.deltaY < 0;
};

export const isScrollingRight = (scrollEvent: WheelEvent): boolean => {
  return scrollEvent.deltaX > 0;
};

export const isScrollingDown = (scrollEvent: WheelEvent): boolean => {
  return scrollEvent.deltaY > 0;
};

export const isScrollingLeft = (scrollEvent: WheelEvent): boolean => {
  return scrollEvent.deltaX < 0;
};
