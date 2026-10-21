import { adminClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "./get-auth";

export const authClient = createAuthClient({
  plugins: [usernameClient(), adminClient(), inferAdditionalFields<Auth>()],
});
