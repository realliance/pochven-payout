import { Button, Label, Spinner, Textarea } from "flowbite-react";
import { FleetMember, useFleetAPI } from "../utils/fleet";
import { RevealText } from "./RevealText";
import { FaArrowRotateRight, FaCircleXmark, FaUsers } from "react-icons/fa6";
import { useContext, useMemo, useState } from "react";
import { IdLookUpFromNames, idFromNames } from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

const EXAMPLE_FLEET = "ConnorJC\nHogTits\nOrisis Wessette";
const loadingButtonContent = (
  <>
    <Spinner size="sm" />
    <span className="pl-3">Checking if you're the Fleet Commander</span>
  </>
);

const notOfRole = (
  <>
    <FaCircleXmark />
    <span className="pl-3">Cannot Auto Import</span>
  </>
);

interface SetupFleetProps {
  currentFleetMembers: FleetMember[];
  setFleetMembers: (fleetMembers: FleetMember[]) => void;
}

export function SetUpFleet({
  currentFleetMembers,
  setFleetMembers,
}: SetupFleetProps) {
  const [importLoading, setImportLoading] = useState(false);
  const [importText, setImportText] = useState("");
  const { token } = useContext(AuthContext);
  const { loading, userFleet, fleetMembers, reload } = useFleetAPI();
  const isFleetCommander = userFleet?.role === "fleet_commander";

  const importContent = useMemo(
    () => (
      <>
        <FaUsers />
        <span className="pl-3">
          Import {fleetMembers?.length} Fleet Members
        </span>
      </>
    ),
    [fleetMembers],
  );

  const importMembersFromList = async () => {
    if (token) {
      setImportLoading(true);
      const splitText = importText.split("\n");
      const data = await idFromNames(token, splitText);

      const ids = data as IdLookUpFromNames;
      const newFleetMembers: FleetMember[] =
        ids.characters?.map((char) => {
          return {
            characterId: char.id!,
            name: char.name!,
            eligible: true,
            partOfSitePayout: true,
          };
        }) ?? [];

      setImportText("");
      setFleetMembers([...currentFleetMembers, ...newFleetMembers]);
      setImportLoading(false);
    }
  };

  const autoImportButtonContent = loading
    ? loadingButtonContent
    : isFleetCommander
      ? importContent
      : notOfRole;

  return (
    <>
      <RevealText text="Add Fleet Members" className="text-2xl" />
      <Button
        outline
        gradientDuoTone="pinkToOrange"
        disabled={!isFleetCommander}
      >
        {autoImportButtonContent}
      </Button>
      <div
        className="text-sm flex flex-row gap-1 text-gray-400 hover:cursor-pointer"
        onClick={reload}
      >
        <FaArrowRotateRight className="w-3" />
        <span className="underline">Refresh Fleet Status</span>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="block">
          <Label
            htmlFor="memberImport"
            value="Import Members"
            className="text-xl"
          />
        </div>
        <Textarea
          id="memberImport"
          placeholder={EXAMPLE_FLEET}
          required
          rows={6}
          value={importText}
          onInput={(e) => setImportText(e.currentTarget.value)}
        />
        <Button
          outline
          gradientDuoTone="pinkToOrange"
          fullSized
          disabled={importLoading}
          onClick={importMembersFromList}
        >
          {importLoading && <Spinner size="sm" />} Import
        </Button>
      </div>
    </>
  );
}
