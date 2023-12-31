import { useContext, useEffect, useState } from "react";
import { CharacterFleet, FleetMembers, fleet, getFleetMembers } from "./api";
import { AuthContext } from "../contexts/AuthContext";

interface FleetContext {
  loading: boolean;
  autoMode: boolean;
  userFleet?: CharacterFleet;
  fleetMembers?: FleetMembers;
  reload: () => void;
}

export interface FleetMemberTable {
  [characterId: string]: FleetMember;
}

export interface FleetMember {
  characterId: number;
  name: string;
  altOfId?: number;
  eligible: boolean;
  partOfSitePayout: boolean;
}

export function useFleetAPI(): FleetContext {
  const { token, identity } = useContext(AuthContext);
  const [userFleet, setUserFleet] = useState<CharacterFleet | undefined>(
    undefined,
  );
  const [fleetMembers, setFleetMembers] = useState<FleetMembers | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(false);

  // Current fleet syncing
  useEffect(() => {
    const run = async () => {
      if (loading && token && identity?.id) {
        const { data: fleetData, error: fleetError } = await fleet(
          token,
          identity?.id,
        );
        if (fleetError) {
          setLoading(false);
          setUserFleet(undefined);
          setFleetMembers(undefined);
          console.info(fleetError);
          return;
        }

        setUserFleet(fleetData);

        const characterFleet = fleetData as CharacterFleet;
        if (
          characterFleet.fleet_id &&
          characterFleet.role === "fleet_commander"
        ) {
          setAutoMode(true);
          const { data, error } = await getFleetMembers(
            token,
            characterFleet.fleet_id,
          );
          if (error) {
            setAutoMode(false);
            console.error(error);
            return;
          }

          setFleetMembers(data);
        } else {
          setAutoMode(false);
        }
      }

      setLoading(false);
    };

    run();
  }, [token, identity, loading]);

  return {
    loading,
    autoMode,
    userFleet,
    fleetMembers,
    reload: () => {
      setLoading(true);
    },
  };
}
