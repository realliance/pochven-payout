import { useMemo } from "react";
import { FleetMember, FleetMemberTable } from "../utils/fleet";
import { Avatar, Checkbox, Select, Table } from "flowbite-react";
import { RevealText } from "./RevealText";
import { AnimatePresence } from "framer-motion";
import { m } from "framer-motion";

interface MemberWithAlts {
  member: FleetMember;
  alts: FleetMember[];
}

interface FleetGroupByAlt {
  [characterId: string]: MemberWithAlts;
}

interface MemberListProps {
  members: FleetMemberTable;
  setFleetMembers: (fleetMembers: FleetMemberTable) => void;
}

export function MemberList({ members, setFleetMembers }: MemberListProps) {
  const onAltMainUpdate = (member: FleetMember, altId: number) => {
    const newTable: FleetMemberTable = { ...members };
    newTable[member.characterId].altOfId =
      altId === member.characterId ? undefined : altId;

    setFleetMembers(newTable);
  };

  const onEligibilityUpdate = (member: FleetMember) => {
    const newTable: FleetMemberTable = { ...members };
    newTable[member.characterId].eligible =
      !newTable[member.characterId].eligible;

    setFleetMembers(newTable);
  };

  const onInPayoutUpdate = (member: FleetMember) => {
    const newTable: FleetMemberTable = { ...members };
    newTable[member.characterId].partOfSitePayout =
      !newTable[member.characterId].partOfSitePayout;

    setFleetMembers(newTable);
  };

  const list = useMemo(() => {
    const altGroups: FleetGroupByAlt = {};
    const allMembers = Object.values(members);
    allMembers
      .filter((member) => member.altOfId === undefined)
      .forEach((member) => {
        altGroups[member.characterId] = {
          member,
          alts: [],
        };
      });

    allMembers
      .filter((member) => member.altOfId !== undefined)
      .forEach((member) => {
        altGroups[member.altOfId!].alts.push(member);
      });

    const altGroupsSorted = Object.values(altGroups).sort((a, b) =>
      a.member.name < b.member.name ? -1 : 1,
    );

    const memberList = altGroupsSorted.flatMap((memberWithAlts) => {
      return [
        memberWithAlts.member,
        ...memberWithAlts.alts.sort((a, b) => (a.name < b.name ? -1 : 1)),
      ];
    });

    return memberList.map((member) => {
      const otherMembers = memberList.filter(
        (m) => m.altOfId === undefined && m.characterId !== member.characterId,
      );

      const otherMemberOptions = otherMembers.map((member) => (
        <option value={member.characterId} key={member.characterId}>
          Alt of {member.name}
        </option>
      ));

      return (
        <m.tr
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
          key={member.characterId}
          layout={true}
          transition={{ type: "spring" }}
        >
          <Table.Cell>
            <Avatar
              rounded
              img={`https://images.evetech.net/characters/${member.characterId}/portrait?tenant=tranquility&size=256`}
            />
          </Table.Cell>
          <Table.Cell>{member.name}</Table.Cell>
          <Table.Cell>
            <Select
              id="relation-select"
              value={member.altOfId ?? member.characterId}
              onChange={(e) =>
                onAltMainUpdate(member, Number(e.currentTarget.value))
              }
            >
              <option value={member.characterId}>Main Character</option>
              {otherMemberOptions}
            </Select>
          </Table.Cell>
          <Table.Cell>
            <Checkbox
              checked={member.eligible}
              id="eligible"
              onChange={() => onEligibilityUpdate(member)}
            />
          </Table.Cell>
          <Table.Cell>
            <Checkbox
              checked={member.partOfSitePayout}
              id="part-of-payout"
              onChange={() => onInPayoutUpdate(member)}
            />
          </Table.Cell>
        </m.tr>
      );
    });
  }, [members]);

  const table = useMemo(
    () =>
      list.length > 0 ? (
        <Table striped className="w-full dark:bg-slate-800 rounded">
          <Table.Head>
            <Table.HeadCell>
              <span className="sr-only">Character Portrait</span>
            </Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Main/Alt</Table.HeadCell>
            <Table.HeadCell>Eligible?</Table.HeadCell>
            <Table.HeadCell>In this Payout?</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            <AnimatePresence>{list}</AnimatePresence>
          </Table.Body>
        </Table>
      ) : (
        <p className="text-gray-400">
          Fleet Members will appear here once added.
        </p>
      ),
    [list],
  );

  return (
    <>
      <RevealText text="Manage Fleet" className="text-2xl" />
      {table}
    </>
  );
}
