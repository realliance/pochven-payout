import { Label, Table, TextInput } from "flowbite-react";
import { RevealText } from "./RevealText";
import { AnimatePresence } from "framer-motion";
import { FleetMemberTable, groupFleetByMains } from "../utils/fleet";
import { useMemo } from "react";
import { m } from "framer-motion";

export const FLASHPOINT_15_PER_PERSON = 236000000;

export interface PayInContext {
  expectedSitePayout: number;
}

interface PayInProps {
  fleetMembers: FleetMemberTable;
  context: PayInContext;
  setContext: (context: PayInContext) => void;
}

export function PayIn({ fleetMembers, context, setContext }: PayInProps) {
  const membersInPayout = useMemo(
    () =>
      Object.values(fleetMembers).filter((member) => member.partOfSitePayout),
    [fleetMembers],
  );

  const list = useMemo(() => {
    // Get alt groups
    const altGroups = groupFleetByMains(membersInPayout);

    // Keep list small by only showing mains
    const mains = membersInPayout.filter(
      (member) => member.altOfId === undefined,
    );

    return mains.map((member) => (
      <m.tr
        className="bg-white dark:border-gray-700 dark:bg-gray-800"
        key={member.characterId}
        layout={true}
        transition={{ type: "spring" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Table.Cell>{member.name}</Table.Cell>
        <Table.Cell>{altGroups[member.characterId].alts.length + 1}</Table.Cell>
        <Table.Cell>{new Intl.NumberFormat().format(0)}</Table.Cell>
      </m.tr>
    ));
  }, [membersInPayout]);

  const payOutPerCharacter = useMemo(
    () =>
      membersInPayout.length > 0
        ? `${new Intl.NumberFormat().format(
            context.expectedSitePayout / membersInPayout.length,
          )}`
        : "???",
    [membersInPayout, context],
  );

  return (
    <div className="w-full lg:w-3/4 mt-2 flex flex-col gap-2 items-center">
      <RevealText text="Pay In" className="text-3xl mb-1" />
      <div className="w-full flex flex-row gap-10 my-6">
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-1 block">
              <Label
                htmlFor={"pay-in"}
                value={"Expected Site Payout"}
                className="text-xl mono-one"
              />
            </div>
            <TextInput
              id="large"
              addon="ISK"
              value={new Intl.NumberFormat().format(context.expectedSitePayout)}
              onChange={(event) => {
                setContext({
                  ...context,
                  expectedSitePayout: Number(
                    event.currentTarget.value
                      .split("")
                      .filter((c) => c !== ",")
                      .join(""),
                  ),
                });
              }}
            />
          </div>
          <div>
            <div className="mb-1 block">
              <Label
                htmlFor={"pay-per-person"}
                value={"Expected Site Payout per Character"}
                className="text-xl mono-one"
              />
            </div>
            <TextInput
              id="large"
              addon="ISK"
              disabled={true}
              value={payOutPerCharacter}
            />
          </div>
        </div>
        <div className="grow">
          <Table striped className="w-full dark:bg-slate-800 rounded">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Characters in Payout</Table.HeadCell>
              <Table.HeadCell>ISK Received from Player</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              <AnimatePresence>{list}</AnimatePresence>
            </Table.Body>
          </Table>
          {list.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              Fleet Members will appear here once marked as "In this Payout".
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
