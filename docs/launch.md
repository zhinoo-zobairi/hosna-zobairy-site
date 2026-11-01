# Launch guide

The steps to take the site from this repo to hosnazobairy.com. Steps marked **(you)** need your accounts, payment or secrets. Claude can't do those.

Do them in order. Step 6 is the go/no-go: if the site doesn't load from Sna, stop before buying the domain.

## 1. Push the code to a private GitHub repo

Claude can run this once you say go:

```bash
gh repo create hosna-zobairy-site --private --source . --push
```

## 2. Create the Vercel project (you)

1. Go to vercel.com and sign up with **Continue with GitHub**. Choose the **Hobby** plan; it's free while the site isn't live.
2. Click **Add New… → Project** and import `hosna-zobairy-site`.
3. Under **Build and Output Settings**, the Build Command must be `npm run build`. Leave everything else as it is: Nitro writes `.vercel/output`, which Vercel picks up on its own.
4. Click **Deploy**. This first deploy has no database yet, so the page shows the bundled text and the form returns an error. That's expected.

## 3. Add the database (you)

1. In the project, open the **Storage** tab and click **Create Database**. Choose **Neon**, then the **Free** plan.
2. Pick the **AWS US East 1 (N. Virginia)** region so the database sits next to Vercel's default function region (Washington, D.C., `iad1`).
3. Connect it to this project for **Production only**. Untick Preview and Development. This adds `DATABASE_URL` for you. Every build runs the migrations, so a preview of an unmerged branch must never reach the real database or the real patient requests. Previews show the bundled text, and their form and admin don't work.

## 4. Add the other settings (you)

Go to **Settings → Environment Variables** and add these for **Production** only:

| Name | Value |
|---|---|
| `BETTER_AUTH_SECRET` | Run `openssl rand -base64 32` in your terminal and paste the output. Never reuse it anywhere else. |
| `BETTER_AUTH_URL` | `https://<your-project>.vercel.app` for now. Change it to `https://hosnazobairy.com` in step 8. |
| `RESEND_API_KEY` | From resend.com: sign up, open **API Keys → Create API Key** with **Sending access**, and copy it. |
| `MAIL_FROM` | `Dr. Zobairy site <onboarding@resend.dev>` until step 9 |
| `CLINIC_EMAIL` | Until step 9 this must be the same email you signed up to Resend with. Resend's test sender only delivers to the account owner. |

Then open **Deployments**, find the latest one, and choose **⋯ → Redeploy**. The build log should show `[migrate] applied 0001_auth.sql` and `0002_site.sql`.

## 5. Create the admin accounts (you, in your terminal)

1. In Vercel, open **Storage → your Neon database → .env.local tab** and copy the `DATABASE_URL` value to the clipboard.
2. In this repo, run the command below. Reading the URL from the clipboard keeps it out of your shell history.

```bash
DATABASE_URL="$(pbpaste)" node scripts/create-admin.mjs you@example.com "Your Name"
```

The script asks for the password twice and doesn't show what you type. It needs 12 or more characters.

Repeat the command for Dr. Zobairy's own account. Then sign in at `https://<your-project>.vercel.app/admin`.

## 6. Test from Sna (Dr. Zobairy) — go/no-go

Send her the `vercel.app` link. She checks it on both mobile data and home Wi-Fi, **without a VPN**:

- the page and photos load
- the EN/KU switch works
- she can submit a test request, and it shows up in `/admin`
- the clinic email arrives

If the page doesn't load in Iran, stop here and we'll look at hosting again. Don't buy the domain.

## 7. Buy the domain (you)

In Vercel, go to **Domains → Buy** and search for `hosnazobairy.com`. Alternatively, buy it at a registrar and point its nameservers to Vercel.

## 8. Connect the domain (you)

1. In the project, go to **Settings → Domains** and add `hosnazobairy.com`, then `www.hosnazobairy.com`. Set `www` to **redirect to** `hosnazobairy.com`.
2. Change `BETTER_AUTH_URL` to `https://hosnazobairy.com` and redeploy.

## 9. Send email from the domain (you)

1. In Resend, go to **Domains → Add Domain** and enter `hosnazobairy.com`.
2. Add the DNS records Resend shows. If the domain is on Vercel, use **Vercel → Domains → hosnazobairy.com → DNS Records**.
3. Click **Verify**.
4. Set `MAIL_FROM` to `Dr. Zobairy site <requests@hosnazobairy.com>` and `CLINIC_EMAIL` to the clinic's address. Redeploy.

## 10. Go live (you)

- Upgrade the Vercel team to **Pro ($20/month)** under **Settings → Billing**. A public page advertising her services is commercial use, which Hobby doesn't allow.
- Have a native Kurdish speaker read the new form labels in **/admin → Content → KU column**, and fix any wording there.
