import { useSelectContext } from "src/Select/context/SelectProvider";
import { isFunction } from "lodash";

const SelectLoader = () => {
  const context = useSelectContext();
  const {
    components: { SelectLoaderElement: customComponent },
  } = context;

  if (isFunction(customComponent)) {
    return customComponent();
  }

  return <div className="select__spinner spinner--sml"></div>;
};

export default SelectLoader;
