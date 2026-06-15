import { createAuthClient } from "better-auth/vue";
import { magicLinkClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.client ? window.location.origin : "http://localhost:3000",
  plugins: [
    magicLinkClient(),
    organizationClient({
      schema: {
        organization: {
          additionalFields: {
            verified: {
              type: "boolean",
              defaultValue: false,
              required: false,
            },
          },
        },
      },
    })
  ]
});

export const { signIn, signUp, signOut, useSession } = authClient;
