import { FleetGroupByAlt } from "../components/MemberList";
import { ShareSettings } from "../components/ShareEditor";
import { FleetMember, groupFleetByMains } from "./fleet";

export interface Share {
  name: string;
  value: number;
}

export function calculateShares(
  settings: ShareSettings,
  allMembers: FleetMember[],
): Share[] {
  const altGroups: FleetGroupByAlt = groupFleetByMains(allMembers);

  const shares: Share[] = Object.values(altGroups).map((memberWithAlts) => {
    return {
      name: memberWithAlts.member.name,
      value:
        settings.sharesPerMain +
        Math.min(
          // Total shares obtainable via alts
          settings.sharesTotal - settings.sharesPerMain,
          // Payout per alt
          memberWithAlts.alts.length * settings.sharesPerAlt,
        ),
    };
  });

  console.log(shares);

  return shares;
}
