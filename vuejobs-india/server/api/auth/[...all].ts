/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (Better Auth)
 *
 * /api/auth/sign-up/email:
 *   post:
 *     tags: [Auth]
 *     summary: Sign up with email & password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: very-hard-password
 *     responses:
 *       200:
 *         description: Account created — verification email sent
 *       400:
 *         description: Validation error or email already in use
 *
 * /api/auth/sign-in/email:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with email & password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: very-hard-password
 *               rememberMe:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Signed in — session cookie set
 *       401:
 *         description: Invalid credentials or email not verified
 *
 * /api/auth/sign-out:
 *   post:
 *     tags: [Auth]
 *     summary: Sign out the current session
 *     responses:
 *       200:
 *         description: Signed out
 *
 * /api/auth/get-session:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current session and user
 *     responses:
 *       200:
 *         description: Active session data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                 user:
 *                   type: object
 *       401:
 *         description: No active session
 *
 * /api/auth/send-verification-email:
 *   post:
 *     tags: [Auth]
 *     summary: Resend the email verification link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: Verification email sent
 *
 * /api/auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email address via link token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified — auto sign-in if configured
 *       400:
 *         description: Invalid or expired token
 *
 * /api/auth/magic-link/send-magic-link:
 *   post:
 *     tags: [Auth]
 *     summary: Send a magic link sign-in email (existing users only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: Magic link sent
 *       400:
 *         description: Email not found (sign-up disabled for magic link)
 *
 * /api/auth/magic-link/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Verify a magic link token and sign in
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Signed in via magic link
 *       400:
 *         description: Invalid or expired token
 */
import { auth } from "../../utils/auth";
export default defineEventHandler((event) => {
    return auth.handler(toWebRequest(event));
});