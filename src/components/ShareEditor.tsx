import { Label, RangeSlider } from "flowbite-react";
import { RevealText } from "./RevealText";
import { FleetMemberTable } from "../utils/fleet";
import { useMemo } from "react";
import { Share, calculateShares } from "../utils/shares";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const CORP_TAX_COLOR = "#E74694";
const OTHER_SLICE_COLOR = "#9061F9";

export interface ShareSettings {
  sharesPerMain: number;
  sharesPerAlt: number;
  sharesTotal: number;
  corpsTaxPercentage: number;
}

export interface ShareEditorProps {
  fleetMembers: FleetMemberTable;
  settings: ShareSettings;
  setSettings: (value: ShareSettings) => void;
}

function preventDefault(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

function renderLabel(entry: Share) {
  return entry.name;
}

interface RangeInputProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: (input: number) => void;
}

function RangeInput({
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

export function ShareEditor({
  fleetMembers,
  settings,
  setSettings,
}: ShareEditorProps) {
  const fleetMemberList = useMemo(
    () => Object.values(fleetMembers),
    [fleetMembers],
  );
  const shareData: Share[] = useMemo(() => {
    const remainingPercentage = 1.0 - settings.corpsTaxPercentage;

    const shares = calculateShares(settings, fleetMemberList);
    const totalShares = shares.reduce((acc, data) => acc + data.value, 0);
    return [
      { name: "Corporation's Cut", value: settings.corpsTaxPercentage },
      ...shares.map(({ name, value }) => {
        return {
          name,
          value: remainingPercentage * (value / totalShares),
        };
      }),
    ];
  }, [settings, fleetMemberList]);

  return (
    <div className="w-full lg:w-3/4 mt-2 flex flex-col gap-2 items-center">
      <RevealText text="Modify Shares" className="text-3xl mb-1" />
      <div className="flex flex-col md:flex-row gap-2">
        <form onSubmit={preventDefault} className="w-full flex flex-col gap-4">
          <RangeInput
            id="shares-per-mains"
            label="Shares per Mains"
            min={0}
            max={2}
            step={0.5}
            value={settings.sharesPerMain}
            setValue={(sharesPerMain) =>
              setSettings({ ...settings, sharesPerMain })
            }
          />
          <RangeInput
            id="shares-per-alt"
            label="Shares per Alts"
            min={0}
            max={2}
            step={0.5}
            value={settings.sharesPerAlt}
            setValue={(sharesPerAlt) =>
              setSettings({ ...settings, sharesPerAlt })
            }
          />
          <RangeInput
            id="shares-total"
            label="Total Shares per Account"
            min={1}
            max={10}
            step={0.5}
            value={settings.sharesTotal}
            setValue={(sharesTotal) =>
              setSettings({ ...settings, sharesTotal })
            }
          />
        </form>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart width={128} height={128}>
            <Pie
              data={shareData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="50%"
              fill="#8884d8"
              label={renderLabel}
            >
              {shareData.map((_entry, index) => (
                <Cell fill={index === 0 ? CORP_TAX_COLOR : OTHER_SLICE_COLOR} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
