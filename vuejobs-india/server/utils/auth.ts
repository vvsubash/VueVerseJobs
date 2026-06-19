import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../database/db";
import { sendEmail } from "./email";
import { magicLink, organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "developer",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #10b981;">Welcome to VueJobs India!</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
            <p style="margin: 30px 0;">
              <a href="${url}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.5;">If the button above does not work, copy and paste this URL into your browser:</p>
            <p style="color: #2563eb; font-size: 0.875rem; word-break: break-all;">${url}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 0.75rem;">This link will expire soon. If you did not sign up for this account, please ignore this email.</p>
          </div>
        `
      });
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Your Magic Link to Sign In",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #10b981;">Sign In to VueJobs India</h2>
              <p>Hello,</p>
              <p>You requested a magic link to sign in to your account. Click the button below to log in instantly:</p>
              <p style="margin: 30px 0;">
                <a href="${url}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Sign In Instantly
                </a>
              </p>
              <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.5;">If the button above does not work, copy and paste this URL into your browser:</p>
              <p style="color: #2563eb; font-size: 0.875rem; word-break: break-all;">${url}</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 0.75rem;">This link is valid for 1 hour. If you did not request this email, you can safely ignore it.</p>
            </div>
          `
        });
      }
    }),
    organization({
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
    }),
  ]
});
