export const DEFAULT_UI_TAGS = {
  BUTTON: {
    label: "Button",
    value: "button",
    color: "#4A90E2",
  },
  INPUT: {
    label: "Input",
    value: "input",
    color: "#50E3C2",
  },
  RADIO: {
    label: "Radio",
    value: "radio",
    color: "#9B59B6",
  },
  DROPDOWN: {
    label: "Dropdown",
    value: "dropdown",
    color: "#F1C40F",
  },
};

export const DEFAULT_UI_TAGS_ARRAY = Object.values(DEFAULT_UI_TAGS);

export const getUiLabel = (value: string) => {
  return (
    DEFAULT_UI_TAGS_ARRAY.find((label) => label.value === value) ||
    DEFAULT_UI_TAGS.BUTTON
  );
};
