import { useMemo } from "react";
import { FleetMember } from "../utils/fleet";
import { Avatar, Table } from "flowbite-react";
import { RevealText } from "./RevealText";

interface MemberListProps {
  members: FleetMember[];
}

export function MemberList({ members }: MemberListProps) {
  const list = useMemo(
    () =>
      members.map((member) => (
        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            <Avatar
              rounded
              img={`https://images.evetech.net/characters/${member.characterId}/portrait?tenant=tranquility&size=256`}
            />
          </Table.Cell>
          <Table.Cell>{member.name}</Table.Cell>
        </Table.Row>
      )),
    [members],
  );

  const emptyRow = (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table.Cell></Table.Cell>
      <Table.Cell>Members will Appear here</Table.Cell>
    </Table.Row>
  );

  return (
    <>
      <RevealText text="Manage Fleet" className="text-2xl" />
      <Table striped>
        <Table.Head>
          <Table.HeadCell>
            <span className="sr-only">Character Portrait</span>
          </Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {list.length > 0 ? list : emptyRow}
        </Table.Body>
      </Table>
    </>
  );
}
