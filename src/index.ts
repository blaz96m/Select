import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Prevent FontAwesome from injecting its own CSS

export { Select } from "src/Select/main";
export { useSelect, useSelectAsync } from "src/Select/hooks";
export * from "src/Select/types/selectComponentTypes";
export * from "src/Select/types/selectGeneralTypes";
export * from "src/Select/types/selectStateTypes";
