# Andalusia OTP + Brevo setup

This patch is based on the uploaded `AndalusiaCopy(2).zip` project structure.

## Configure Brevo credentials securely

In a terminal, change directory to the `Andalusia` web project (the directory containing `Andalusia.csproj`) and run:

```bash
dotnet user-secrets init
dotnet user-secrets set "Brevo:UserName" "YOUR_BREVO_SMTP_LOGIN"
dotnet user-secrets set "Brevo:Password" "YOUR_BREVO_SMTP_KEY"
dotnet user-secrets set "Brevo:SenderEmail" "YOUR_VERIFIED_SENDER_EMAIL"
```

The `Brevo:Password` value must be the Brevo SMTP key, not the API key and not a Gmail password. Do not commit secrets. The project defaults to `smtp-relay.brevo.com:587` and StartTLS.

## OTP flow

- Register sends a six-digit email verification code and does not issue a usable JWT before verification.
- Confirm email accepts the existing `ConfirmEmailDto` shape: `{ "email": "...", "token": "123456" }`.
- Resend confirmation sends a new code and invalidates prior active verification codes.
- Password reset sends a six-digit code, valid for 10 minutes; reset consumes it once.
- Login with OTP:
  - `POST /api/auth/request-login-otp` with `{ "email": "..." }`
  - `POST /api/auth/verify-login-otp` with `{ "email": "...", "code": "123456" }`
- Login with password remains supported, but only for verified accounts.
- OTP values are hashed with a per-user salt before being stored. Login OTPs reuse the existing password reset token table with a `LOGIN:` prefix; no new migration is intended.

## Before merging

Run `dotnet restore` and `dotnet build` from the solution directory. This environment did not have the .NET SDK available, so compilation could not be executed here. Also connect the frontend forms to the login OTP endpoints if you want passwordless login exposed in the UI.
