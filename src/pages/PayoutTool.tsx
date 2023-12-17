import { Avatar } from "flowbite-react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useFleetAPI } from "../utils/fleet";

export function PayoutTool() {
  const { identity, logout } = useContext(AuthContext);
  const fleetContext = useFleetAPI();

  console.log(fleetContext);

  return (
    <>
      <h1 className="text-4xl mono-one">Pochven Payout</h1>
      <div className="flex flex-row gap-3 items-center">
        { identity?.portrait ? <Avatar img={identity?.portrait} rounded size="md" /> : <Avatar rounded />}
        <div className="flex flex-col">
          { identity?.name ?? "Loading your Identity" }
          <div>
            <a className="underline text-gray-400 hover:cursor-pointer" onClick={logout}>Log Out</a>
          </div>
        </div>
      </div>
    </>
  )
}