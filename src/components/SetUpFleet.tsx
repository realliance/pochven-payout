import { Button, Label, Spinner, Textarea } from "flowbite-react";
import { FleetMember, FleetMemberTable, useFleetAPI } from "../utils/fleet";
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
    <span className="pl-3">Cannot Import Automatically</span>
  </>
);

interface SetupFleetProps {
  currentFleetMembers: FleetMemberTable;
  setFleetMembers: (fleetMembers: FleetMemberTable) => void;
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

  const importMembersFromList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
            partOfSitePayout: false,
          };
        }) ?? [];

      const fleetTableAddition: FleetMemberTable = {};
      newFleetMembers.forEach((member) => {
        fleetTableAddition[member.characterId] = member;
      });

      setImportText("");
      setFleetMembers({ ...currentFleetMembers, ...fleetTableAddition });
      setTimeout(() => setImportLoading(false), 100);
    }
  };

  const autoImportButtonContent = loading
    ? loadingButtonContent
    : isFleetCommander
      ? importContent
      : notOfRole;

  return (
    <>
      <RevealText text="Manage Fleet" className="text-3xl" />
      <Button
        outline
        gradientDuoTone="purpleToPink"
        disabled={!isFleetCommander}
      >
        <span className="flex flex-row items-center">
          {autoImportButtonContent}
        </span>
      </Button>
      <div
        className="text-sm flex flex-row gap-1 text-gray-400 hover:cursor-pointer items-center"
        onClick={reload}
      >
        <FaArrowRotateRight className="w-3" />
        <span className="underline">Refresh Fleet Status</span>
      </div>
      <form
        className="w-full lg:w-1/2 flex flex-col gap-2 px-2"
        onSubmit={importMembersFromList}
      >
        <div className="block">
          <Label
            htmlFor="memberImport"
            value="Import Members"
            className="text-xl mono-one"
          />
        </div>
        <Textarea
          id="memberImport"
          placeholder={EXAMPLE_FLEET}
          required
          rows={6}
          value={importText}
          disabled={importLoading}
          onInput={(e) => setImportText(e.currentTarget.value)}
        />
        <Button
          outline
          gradientDuoTone="purpleToPink"
          fullSized
          disabled={importLoading}
          type="submit"
        >
          <span className="flex flex-row gap-1 items-center">
            {importLoading && <Spinner size="sm" />}
            <span>Import</span>
          </span>
        </Button>
      </form>
    </>
  );
}
