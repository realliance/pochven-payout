import { Avatar } from "flowbite-react";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { FleetMemberTable } from "../utils/fleet";
import { RevealText } from "../components/RevealText";
import { SetUpFleet } from "../components/SetUpFleet";
import { MemberList } from "../components/MemberList";

export function PayoutTool() {
  const { identity, logout } = useContext(AuthContext);
  const [fleetMembers, setFleetMembers] = useState<FleetMemberTable>({});

  return (
    <>
      <RevealText text="Pochven Payout" className="text-5xl" interval={150} />
      <div className="flex flex-row gap-3 items-center">
        {identity?.portrait ? (
          <Avatar img={identity?.portrait} rounded size="md" />
        ) : (
          <Avatar rounded />
        )}
        <div className="flex flex-col">
          {identity?.name ?? "Loading your Identity"}
          <div>
            <a
              className="underline text-gray-400 hover:cursor-pointer"
              onClick={logout}
            >
              Log Out
            </a>
          </div>
        </div>
      </div>
      <SetUpFleet
        currentFleetMembers={fleetMembers}
        setFleetMembers={setFleetMembers}
      />
      <MemberList members={fleetMembers} setFleetMembers={setFleetMembers} />
    </>
  );
}
