using System.Net;
using System.Net.Http.Json;
using Andalusia.ServicesAbstraction;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AndalusiaApp.Services;

public class BrevoSettings
{
    public string ApiKey { get; set; } = "";
    public string SenderEmail { get; set; } = "";
    public string SenderName { get; set; } = "Andalusia";
}

public class BrevoEmailService(
    HttpClient http,
    IOptions<BrevoSettings> options,
    ILogger<BrevoEmailService> logger) : IEmailService
{
    private const string Endpoint = "https://api.brevo.com/v3/smtp/email";

    public async Task SendOtpAsync(string toEmail, string toName, string otp, OtpPurpose purpose, CancellationToken ct = default)
    {
        var settings = options.Value;

        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.SenderEmail))
            throw new InvalidOperationException("Brevo is not configured. Set Brevo:ApiKey and Brevo:SenderEmail.");
        var (subject, heading, intro, validity) = purpose switch
        {
            OtpPurpose.PasswordReset => (
                "Reset your Andalusia password",
                "Password reset",
                "Use the code below to reset your password.",
                "10 minutes"),

            OtpPurpose.Login => (
                "Your Andalusia login code",
                "Login verification",
                "Use the code below to sign in to your account.",
                "5 minutes"),

            OtpPurpose.EmailConfirmation => (
                "Confirm your Andalusia email",
                "Confirm your email",
                "Use the code below to confirm your email address.",
                "10 minutes"),

            _ => throw new ArgumentOutOfRangeException(nameof(purpose), purpose, "Unsupported OTP purpose.")
        };

        var safeName = WebUtility.HtmlEncode(toName);
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px">
              <h2 style="margin:0 0 12px">{heading}</h2>
              <p>Hi {safeName},</p>
              <p>{intro}</p>
              <p style="font-size:32px;letter-spacing:8px;font-weight:bold;margin:24px 0">{otp}</p>
              <p style="color:#666">This code expires in {validity}. If you didn't request it, you can ignore this email.</p>
            </div>
            """;

        var payload = new
        {
            sender = new { name = settings.SenderName, email = settings.SenderEmail },
            to = new[] { new { email = toEmail, name = toName } },
            subject,
            htmlContent = html
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint)
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Add("api-key", settings.ApiKey);

        using var response = await http.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Brevo send failed: {Status} {Body}", (int)response.StatusCode, body);
            throw new InvalidOperationException($"Brevo returned {(int)response.StatusCode}.");
        }
    }
}
