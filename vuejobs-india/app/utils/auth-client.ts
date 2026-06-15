import { createAuthClient } from "better-auth/vue";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.client ? window.location.origin : "http://localhost:3000",
  plugins: [
    magicLinkClient()
  ]
});

export const { signIn, signUp, signOut, useSession } = authClient;
