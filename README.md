# Select UI

An elegant and lightweight React component designed for simplicity and performance.

The goal of this project is to provide a scalable, customizable, and versatile Select component, designed to meet the needs of modern applications. As you explore the features, we hope you'll see how it can be tailored to fit a wide range of use cases.

## Getting Started

To get started, simply install the package via npm:

```sh
npm i select-ui
```

Once installed, you can import the Select component in your project, and you are good to go.

```sh
import { useState } from "react";
import { Select } from "react-select-ui";

type Plant = {
  id: number;
  name: string;
  type: string;
};

const options = [
  { id: 1, name: "Orange", type: "fruit" },
  { id: 2, name: "Lemon", type: "fruit" },
  { id: 3, name: "Banana", type: "fruit" },
  { id: 4, name: "Cherry", type: "fruit" },
  { id: 5, name: "Peach", type: "fruit" },
  { id: 6, name: "Onion", type: "vegetable" },
  { id: 7, name: "Potato", type: "vegetable" },
  { id: 8, name: "Broccoli", type: "vegetable" },
  { id: 9, name: "Carrot", type: "vegetable" },
  { id: 10, name: "Spinach", type: "vegetable" },
];

const SingleValue = () => {
  const [value, setValue] = useState<Plant[]>([]);

  return (
    <Select
      value={value}
      defaultSelectOptions={options}
      onChange={setValue}
      labelKey="name"
      hasInput={false}
    />
  );
};

export default SingleValue;
```

You can learn more about checking out the docs here: https://selectui-docs.netlify.app/
