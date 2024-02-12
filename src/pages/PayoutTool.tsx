import { Avatar } from "flowbite-react";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { FleetMemberTable } from "../utils/fleet";
import { RevealText } from "../components/RevealText";
import { SetUpFleet } from "../components/SetUpFleet";
import { MemberList } from "../components/MemberList";
import { ShareEditor, ShareSettings } from "../components/ShareEditor";

export function PayoutTool() {
  const { identity, logout } = useContext(AuthContext);
  const [fleetMembers, setFleetMembers] = useState<FleetMemberTable>({});
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    sharesPerMain: 1,
    sharesPerAlt: 0.5,
    sharesTotal: 2.5,
    corpsTaxPercentage: 0.15,
  });

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-4 pt-12">
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
      <ShareEditor
        fleetMembers={fleetMembers}
        settings={shareSettings}
        setSettings={setShareSettings}
      />
    </div>
  );
}
