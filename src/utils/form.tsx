import { Label, RangeSlider, TextInput } from "flowbite-react";

interface RangeInputProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: (input: number) => void;
}

export function RangeInput({
  id,
  label,
  min,
  max,
  step,
  value,
  setValue,
}: RangeInputProps) {
  return (
    <div className="w-full my-8">
      <div className="mb-1 block">
        <Label
          htmlFor={id}
          value={`${label}: ${value}`}
          className="text-xl mono-one"
        />
      </div>
      <div className="w-full flex flex-row gap-3 items-center">
        <span className="text-lg">{min}</span>
        <RangeSlider
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="grow"
        />
        <span className="text-lg">{max}</span>
      </div>
    </div>
  );
}

interface NumberInputProps {
  id: string;
  addon?: string;
  label: string;
  value: number | string;
  setValue?: (input: number) => void;
}

export function NumberInput({
  id,
  addon,
  label,
  value,
  setValue,
}: NumberInputProps) {
  return (
    <div className="w-full">
      <div className="mb-1 block">
        <Label htmlFor={id} value={label} className="text-xl mono-one" />
      </div>
      <div className="w-full">
        <TextInput
          id="large"
          addon={addon}
          value={
            typeof value === "number"
              ? new Intl.NumberFormat().format(value)
              : value
          }
          disabled={!setValue}
          onChange={
            setValue
              ? (event) => {
                  const number = Number(
                    event.currentTarget.value
                      .split("")
                      .filter((c) => c !== ",")
                      .join(""),
                  );

                  if (!isNaN(number)) {
                    setValue(number);
                  }
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
