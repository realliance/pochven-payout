import Cookies from "js-cookie";
import * as oauth from "oauth4webapi";
import * as uuid from "uuid";

const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:5173";

const client: oauth.Client = {
  client_id:
    import.meta.env.VITE_CLIENT_ID ?? "9229c7b41eb84f3d85487fca0a5129b6",
  token_endpoint_auth_method: "none",
};

const authServer: oauth.AuthorizationServer = {
  issuer: "https://login.eveonline.com",
  authorization_endpoint: "https://login.eveonline.com/v2/oauth/authorize",
  token_endpoint: "https://login.eveonline.com/v2/oauth/token",
};

export async function beginAuthFlow() {
  const state = uuid.v4();
  localStorage.setItem("state", state);

  const codeVerifier = oauth.generateRandomCodeVerifier();
  Cookies.set("codeVerifier", codeVerifier, {
    sameSite: "strict",
  });
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

  const authorizationUrl = new URL(authServer.authorization_endpoint!);
  authorizationUrl.searchParams.set("client_id", client.client_id);
  authorizationUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set(
    "scope",
    "esi-wallet.read_character_wallet.v1 esi-fleets.read_fleet.v1 esi-ui.open_window.v1 esi-characters.read_chat_channels.v1",
  );
  authorizationUrl.searchParams.set("state", state);

  window.location.href = authorizationUrl.toString();
}

export async function onRedirect(updateToken: (token: string) => void) {
  const currentUrl = new URL(window.location.href);

  const localStorageState = localStorage.getItem("state");

  if (!localStorageState) {
    throw new Error("No state set, cannot continue");
  }

  const codeVerifier = Cookies.get("codeVerifier") ?? "";
  Cookies.remove("codeVerifier");

  if (!codeVerifier) return;

  const parameters = oauth.validateAuthResponse(
    authServer,
    client,
    currentUrl,
    localStorageState,
  );
  if (oauth.isOAuth2Error(parameters)) {
    console.log("error", parameters);
    throw new Error();
  }

  const response = await oauth.authorizationCodeGrantRequest(
    authServer,
    client,
    parameters,
    REDIRECT_URI,
    codeVerifier,
  );

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined;
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log("challenge", challenge);
    }
    throw new Error();
  }

  const result = await oauth.processAuthorizationCodeOAuth2Response(
    authServer,
    client,
    response,
  );
  if (oauth.isOAuth2Error(result)) {
    console.log("error", result);
    throw new Error();
  }

  if (window.history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host;
    window.history.pushState({ path: newurl }, "", newurl);
  }

  updateToken(result.access_token);
}
