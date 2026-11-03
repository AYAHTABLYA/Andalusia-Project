using Andalusia.ServicesAbstraction;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using System.Net.Mail;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace AndalusiaApp.Services;

public class MailKitEmailService(
    IConfiguration config,
    ILogger<MailKitEmailService> logger) : IEmailService
{
    public async Task SendOtpAsync(string toEmail, string toName, string otp, OtpPurpose purpose, CancellationToken ct = default)
    {
        var host = config["Brevo:Host"] ?? "smtp-relay.brevo.com";
        var port = int.Parse(config["Brevo:Port"] ?? "587");
        var user = config["Brevo:UserName"];
        var pass = config["Brevo:Password"];
        var senderEmail = config["Brevo:SenderEmail"];
        var senderName = config["Brevo:SenderName"] ?? "Andalusia Academy";

        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass) ||
            string.IsNullOrWhiteSpace(senderEmail))
            throw new InvalidOperationException("Brevo SMTP settings are missing. Configure Brevo:UserName, Brevo:Password, and Brevo:SenderEmail.");

        // The repo ships a placeholder password; sending with it can never work.
        if (pass.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase) ||
            user.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Brevo:UserName / Brevo:Password still hold the YOUR_... placeholder. Set the real Brevo SMTP login and SMTP key (dotnet user-secrets).");

        var (subject, heading, intro) = purpose switch
        {
            OtpPurpose.PasswordReset => ("Reset your Andalusia password", "Password Reset", "Use this code to reset your password:"),
            OtpPurpose.Login => ("Your Andalusia sign-in code", "Sign in to Andalusia", "Use this code to sign in:"),
            _ => ("Confirm your Andalusia email", "Confirm Your Email", "Use this code to confirm your email:")
        };
        var safeName = System.Net.WebUtility.HtmlEncode(toName);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            // Plain-text part: mail without one is more likely to be filed as spam.
            TextBody = $"{heading}\n\nHi {toName},\n\n{intro} {otp}\n\nThis code expires in 10 minutes and can only be used once. If you didn't request it, you can ignore this email.",
            HtmlBody = $"""
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
                  <h2 style="margin:0 0 12px;color:#1e293b">{heading}</h2>
                  <p style="color:#475569">Hi {safeName},</p>
                  <p style="color:#475569">{intro}</p>
                  <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#2563eb;margin:24px 0;text-align:center">{otp}</p>
                  <p style="color:#94a3b8;font-size:13px">This code expires in 10 minutes and can only be used once. If you didn't request it, you can ignore this email.</p>
                </div>
                """
        };

        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient { Timeout = 10_000 };
        try
        {
            // الاتصال بسيرفر SMTP مع تفعيل تشفير StartTLS
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(user, pass, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            logger.LogInformation("OTP email sent successfully via MailKit to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "MailKit failed to send email to {Email}: {Reason}", toEmail, ex.Message);

            // Local development only (off unless Email:LogOtpWhenUndeliverable=true):
            // print the code so the flow can still be tested while SMTP is being set up.
            if (string.Equals(config["Email:LogOtpWhenUndeliverable"], "true", StringComparison.OrdinalIgnoreCase))
                logger.LogWarning("DEV ONLY - undeliverable {Purpose} code for {Email}: {Otp}", purpose, toEmail, otp);

            throw;
        }
    }
}