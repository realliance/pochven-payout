import { RevealText } from "./RevealText";
import { FleetMemberTable } from "../utils/fleet";
import { useMemo } from "react";
import { Share, calculateShares, taxToPercentage } from "../utils/shares";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PayInContext } from "./PayIn";
import { NumberInput, RangeInput } from "../utils/form";
import { Select } from "flowbite-react";

const CORP_TAX_COLOR = "#E74694";
const OTHER_SLICE_COLOR = "#9061F9";

export enum TaxType {
  Flat = "Ƶ",
  Percent = "%",
}

export interface ShareSettings {
  sharesPerMain: number;
  sharesPerAlt: number;
  sharesTotal: number;
  corpTaxType: TaxType;
  corpTaxValue: number;
  sigTaxType: TaxType;
  sigTaxValue: number;
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
    const corpsPercentage = taxToPercentage(
      settings.corpTaxType,
      settings.corpTaxValue,
      payInContext.expectedSitePayout,
    );

    const sigSrpPercentage = taxToPercentage(
      settings.sigTaxType,
      settings.sigTaxValue,
      payInContext.expectedSitePayout,
    );

    const remainingPercentage = 1.0 - corpsPercentage - sigSrpPercentage;

    const shares = calculateShares(settings, fleetMemberList);
    const totalShares = shares.reduce((acc, data) => acc + data.value, 0);

    const sharesPoints = shares.map(({ name, value }) => {
      return {
        name,
        value: remainingPercentage * (value / totalShares),
      };
    });

    const sharesAllocated =
      shares.length > 0
        ? sharesPoints
        : [{ name: "Unallocated", value: remainingPercentage }];

    return [
      { name: "Corporation's Cut", value: corpsPercentage },
      { name: "SIG SRP Fund", value: sigSrpPercentage },
      ...sharesAllocated,
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
            corpTaxType: e.currentTarget.value as TaxType,
            corpTaxValue:
              e.currentTarget.value === TaxType.Percent ? 0.1 : 500_000_000,
          })
        }
      >
        {[TaxType.Flat, TaxType.Percent].map((taxType) => (
          <option key={taxType} value={taxType}>
            {taxType}
          </option>
        ))}
      </Select>
    ),
    [settings],
  );

  const sigTaxSelect = useMemo(
    () => (
      <Select
        id="sig-tax-type"
        className="basis-1/3"
        value={settings.sigTaxType}
        onChange={(e) =>
          setSettings({
            ...settings,
            sigTaxType: e.currentTarget.value as TaxType,
            sigTaxValue:
              e.currentTarget.value === TaxType.Percent ? 0.1 : 500_000_000,
          })
        }
      >
        {[TaxType.Flat, TaxType.Percent].map((taxType) => (
          <option key={taxType} value={taxType}>
            {taxType}
          </option>
        ))}
      </Select>
    ),
    [settings],
  );

  return (
    <div className="w-full lg:w-3/4 mt-2 flex flex-col gap-2 items-center">
      <RevealText text="Modify Shares" className="text-3xl mb-1" />
      <div className="w-full flex flex-col md:flex-row gap-2">
        <form
          onSubmit={preventDefault}
          className="w-full flex flex-col gap-4 basis-1/3"
        >
          <div className="flex flex-row gap-2 w-full items-end">
            {corpTaxSelect}
            <NumberInput
              id="tax-value"
              label="Corp Fee"
              value={
                settings.corpTaxType === TaxType.Percent
                  ? settings.corpTaxValue * 100
                  : settings.corpTaxValue
              }
              setValue={(corpTaxValue) =>
                setSettings({
                  ...settings,
                  corpTaxValue:
                    settings.corpTaxType === TaxType.Percent
                      ? corpTaxValue / 100
                      : corpTaxValue,
                })
              }
            />
          </div>
          <div className="flex flex-row gap-2 w-full items-end">
            {sigTaxSelect}
            <NumberInput
              id="sig-srp-tax-value"
              label="SIG SRP Fee"
              value={
                settings.sigTaxType === TaxType.Percent
                  ? settings.sigTaxValue * 100
                  : settings.sigTaxValue
              }
              setValue={(sigTaxValue) =>
                setSettings({
                  ...settings,
                  sigTaxValue:
                    settings.sigTaxType === TaxType.Percent
                      ? sigTaxValue / 100
                      : sigTaxValue,
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
            step={0.25}
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
            step={0.25}
            value={settings.sharesTotal}
            setValue={(sharesTotal) =>
              setSettings({ ...settings, sharesTotal })
            }
          />
        </form>
        <div className="grow">
          <ResponsiveContainer width="100%" height={500}>
            <PieChart width={256} height={256}>
              <Pie
                data={shareData}
                dataKey="value"
                nameKey="name"
                outerRadius="80%"
                label={(prop) => prop.name}
              >
                {shareData.map((_entry, index) => (
                  <Cell
                    fill={
                      index === 0 || index === 1
                        ? CORP_TAX_COLOR
                        : OTHER_SLICE_COLOR
                    }
                  />
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
    </div>
  );
}
