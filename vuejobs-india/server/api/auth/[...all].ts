import { auth } from "../../utils/auth";

defineRouteMeta({
  openAPI: {
    summary: "Better Auth API Gateway",
    description: "Catch-all handler for Better Auth endpoints (e.g. sign-in, sign-up, sign-out, session, verify-email)",
    tags: ["auth"],
    parameters: [
      {
        name: "all",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "The authentication sub-route/action (e.g. sign-in, sign-up, sign-out, session)",
      }
    ]
  }
});

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
