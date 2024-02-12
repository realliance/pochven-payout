import { Label, Table, TextInput } from "flowbite-react";
import { RevealText } from "./RevealText";
import { AnimatePresence } from "framer-motion";
import { FleetMemberTable } from "../utils/fleet";
import { useMemo } from "react";
import { m } from "framer-motion";

interface PayInProps {
  fleetMembers: FleetMemberTable;
}

export function PayIn({ fleetMembers }: PayInProps) {
  const membersInPayout = useMemo(
    () =>
      Object.values(fleetMembers).filter((member) => member.partOfSitePayout),
    [fleetMembers],
  );

  const list = useMemo(
    () =>
      // Only show mains to keep list small, wallet tracking logic will check off based on main-alt groups
      membersInPayout.map((member) => (
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
          <Table.Cell>0</Table.Cell>
        </m.tr>
      )),
    [membersInPayout],
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
            <TextInput id="large" type="number" addon="ISK" />
          </div>
          <div>
            <div className="mb-1 block">
              <Label
                htmlFor={"pay-per-person"}
                value={"Expected Site Payout per Character"}
                className="text-xl mono-one"
              />
            </div>
            <TextInput id="large" type="number" addon="ISK" />
          </div>
        </div>
        <div className="grow">
          <Table striped className="w-full dark:bg-slate-800 rounded">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
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
