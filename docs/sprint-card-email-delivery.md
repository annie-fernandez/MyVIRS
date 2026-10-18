# Restore outbound email (password reset + contact form)

**Type:** Configuration / infrastructure · **Size:** S–M (½ day for Part 1, then blocked on DNS)
**Priority:** High — password reset is currently unusable, so any locked-out user is permanently locked out.

## Problem

The app sends no email at all. It is written to send through [Resend](https://resend.com), and Resend has never been set up, so `RESEND_API_KEY` does not exist in Vercel. Three consequences on the live site (`https://www.myvirs.com`):

| Feature | Current behavior |
| --- | --- |
| Forgot Password | Page says "check your email." No email is sent. User stays locked out. |
| Contact Us form | Submits successfully. Message is silently discarded. |
| Signup verification | Not implemented at all — see *Out of scope*. |

The failure is silent by design of the send path: the reset email is dispatched after the HTTP response is returned (so response timing can't reveal whether an account exists), so nothing can report the failure to the user.

**Careful:** this reproduces *only in production*. Locally, with no API key, `sendEmail` prints the message to the terminal instead of throwing (`apps/virs/src/lib/email.ts:18-23`). "It works on my machine" is expected and proves nothing here.

## Part 1 — Prove delivery works, with no DNS (do this first)

Resend will not send mail claiming to come from `myvirs.com` until the domain is verified. It *will* send from its own sandbox address, `onboarding@resend.dev`, but that sender **only delivers to the email address that owns the Resend account**. So:

1. Create a Resend account using **`vocabinreading@gmail.com`** (this is what makes sandbox delivery testable — a different signup address will not receive anything).
2. Create an API key.
3. In Vercel → Project → Settings → Environment Variables, add to **Production**:
   - `RESEND_API_KEY` = the key
   - `EMAIL_FROM` = `onboarding@resend.dev` — bare address, **no display name, no angle brackets, no quotes**
4. Redeploy.
5. Register a test account whose email is `vocabinreading@gmail.com`, then use Forgot Password on it.

Reset emails go to *the account's own* email address, which is why the test account must use that specific address while in sandbox mode.

**Done when:** the reset email arrives in `vocabinreading@gmail.com`, its link opens the reset page, and the new password logs in.

## Part 2 — Send from myvirs.com (needs DNS access)

1. Resend → Domains → add `myvirs.com`; it issues DKIM/SPF records.
2. Add those records wherever `myvirs.com` DNS is managed (the domain currently resolves to Vercel, so check Vercel's domain settings first).
3. Wait for Resend to report the domain verified.
4. In Vercel, **delete** the `EMAIL_FROM` override. The code default `VIRS <do-not-reply@myvirs.com>` (`apps/virs/src/lib/env.ts:9`) then takes over — matching the sender the legacy Spring app used.
5. Redeploy.

**Done when:** a reset email sent to a non-`vocabinreading` address (any personal inbox) arrives, is from `do-not-reply@myvirs.com`, and does not land in spam.

## Also verify

- **Contact form** — submit it on the live site; the message should arrive at `vocabinreading@gmail.com` with the sender's address as Reply-To (`apps/virs/src/app/api/contact/route.ts`). This inbox is monitored by Annie.
- **Vercel logs are clean** — no `[auth] password reset email failed to send` and no `[api] … server_misconfigured` lines after the above.

## Gotchas that will otherwise cost a day

- **One malformed variable breaks every endpoint.** `env()` validates all Vercel settings in a single pass, so a bad value in *any* of them makes the whole API fail, not just the feature it belongs to. This already happened once: a malformed `CONTACT_EMAIL_TO` took down registration. After editing any variable, load the site and confirm login still works.
- `CONTACT_EMAIL_TO` must be a **bare** address. `EMAIL_FROM` is the only email variable that accepts a `Name <addr>` display-name form.
- Environment variable changes **do not apply until you redeploy.**
- Set variables on the **Production** environment, not just Preview.

## Out of scope

**Signup verification emails do not exist** — no `sendVerificationEmail` is configured in `apps/virs/src/lib/auth.ts`, so accounts are usable immediately. The legacy app behaved the same way, so this is not a regression. If the product owner wants email confirmation on signup, that is a separate card with a code change.

## Blocked on / needs from Annie

- Vercel project access (to add environment variables and redeploy)
- Credentials for, or a mailbox invite to, `vocabinreading@gmail.com`
- DNS access for `myvirs.com` — Part 2 only; Part 1 can finish without it
