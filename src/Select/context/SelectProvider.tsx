import { useContext, createContext, useMemo, memo } from "react";
import {
  SelectCustomClassNames,
  SelectCustomRefs,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectContextProps,
  SelectCustomComponents,
} from "src/Select/types/selectComponentTypes";

type SelectContextT = {
  components: Partial<SelectCustomComponents>;
  classNames: Partial<SelectCustomClassNames>;
  refs: Partial<SelectCustomRefs>;
};

const SelectContext = createContext<SelectContextT>({
  components: {},
  classNames: {},
  refs: {},
});

export const SelectProvider = ({
  customComponents = {},
  classNames = {},
  refs = {},
  children,
}: SelectContextProps) => {
  const data: SelectContextT = useMemo(
    () => ({
      components: customComponents,
      classNames,
      refs,
    }),
    []
  );

  return (
    <SelectContext.Provider value={data}>{children}</SelectContext.Provider>
  );
};

export const useSelectContext = () => useContext(SelectContext);
