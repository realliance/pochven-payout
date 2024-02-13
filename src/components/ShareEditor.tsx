import { RevealText } from "./RevealText";
import { FleetMemberTable } from "../utils/fleet";
import { useMemo } from "react";
import { Share, calculateShares } from "../utils/shares";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PayInContext } from "./PayIn";
import { NumberInput, RangeInput } from "../utils/form";
import { Select } from "flowbite-react";

const CORP_TAX_COLOR = "#E74694";
const OTHER_SLICE_COLOR = "#9061F9";

export enum CorporationTaxType {
  Flat = "Flat",
  Percent = "Percent",
}

export interface ShareSettings {
  sharesPerMain: number;
  sharesPerAlt: number;
  sharesTotal: number;
  corpTaxType: CorporationTaxType;
  corpTaxValue: number;
}

export interface ShareEditorProps {
  payInContext: PayInContext;
  fleetMembers: FleetMemberTable;
  settings: ShareSettings;
  setSettings: (value: ShareSettings) => void;
}

function preventDefault(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

export function ShareEditor({
  payInContext,
  fleetMembers,
  settings,
  setSettings,
}: ShareEditorProps) {
  const fleetMemberList = useMemo(
    () => Object.values(fleetMembers).filter((member) => member.eligible),
    [fleetMembers],
  );

  const shareData: Share[] = useMemo(() => {
    const corpsPercentage =
      settings.corpTaxType === CorporationTaxType.Percent
        ? settings.corpTaxValue
        : // Flat Rate converted to percent of payout
          settings.corpTaxValue / payInContext.expectedSitePayout;

    const remainingPercentage = 1.0 - corpsPercentage;

    const shares = calculateShares(settings, fleetMemberList);
    const totalShares = shares.reduce((acc, data) => acc + data.value, 0);
    return [
      { name: "Corporation's Cut", value: corpsPercentage },
      ...shares.map(({ name, value }) => {
        return {
          name,
          value: remainingPercentage * (value / totalShares),
        };
      }),
    ];
  }, [settings, fleetMemberList, payInContext]);

  const corpTaxSelect = useMemo(
    () => (
      <Select
        id="corp-tax-type"
        className="basis-1/3"
        value={settings.corpTaxType}
        onChange={(e) =>
          setSettings({
            ...settings,
            corpTaxType: e.currentTarget.value as CorporationTaxType,
            corpTaxValue:
              e.currentTarget.value === CorporationTaxType.Percent
                ? 0.15
                : 500_000_000,
          })
        }
      >
        {[CorporationTaxType.Flat, CorporationTaxType.Percent].map(
          (taxType) => (
            <option key={taxType} value={taxType}>
              {taxType}
            </option>
          ),
        )}
      </Select>
    ),
    [settings],
  );

  return (
    <div className="w-full lg:w-3/4 mt-2 flex flex-col gap-2 items-center">
      <RevealText text="Modify Shares" className="text-3xl mb-1" />
      <div className="flex flex-col md:flex-row gap-2">
        <form onSubmit={preventDefault} className="w-full flex flex-col gap-4">
          <div className="flex flex-row gap-2 w-full items-end">
            {corpTaxSelect}
            <NumberInput
              id="tax-value"
              label={
                settings.corpTaxType === CorporationTaxType.Flat
                  ? "Corp's $$ Fee"
                  : "Corp's % Fee"
              }
              value={
                settings.corpTaxType === CorporationTaxType.Percent
                  ? settings.corpTaxValue * 100
                  : settings.corpTaxValue
              }
              setValue={(corpTaxValue) =>
                setSettings({
                  ...settings,
                  corpTaxValue:
                    settings.corpTaxType === CorporationTaxType.Percent
                      ? corpTaxValue / 100
                      : corpTaxValue,
                })
              }
            />
          </div>
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
              outerRadius="60%"
            >
              {shareData.map((_entry, index) => (
                <Cell fill={index === 0 ? CORP_TAX_COLOR : OTHER_SLICE_COLOR} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                `${Math.round((Number(value) + Number.EPSILON) * 100)}%`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
