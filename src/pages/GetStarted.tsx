import { RevealText } from "../components/RevealText";
import { useDarkMode } from "usehooks-ts";
import { m } from "framer-motion";

import ssoDark from "../assets/eve-sso-login-black-large.png";
import ssoLight from "../assets/eve-sso-login-white-large.png";
import { beginAuthFlow } from "../oauth";

export function GetStarted() {
  const { isDarkMode } = useDarkMode();

  return (
    <>
      <RevealText text="Pochven Payout" className="text-4xl" />
      <button onClick={beginAuthFlow} className="cursor-pointer">
        <m.img
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.25 },
          }}
          src={isDarkMode ? ssoLight : ssoDark}
        />
      </button>
    </>
  );
}
