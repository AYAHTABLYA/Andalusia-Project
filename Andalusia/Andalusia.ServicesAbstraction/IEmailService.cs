namespace Andalusia.ServicesAbstraction;

public interface IEmailService
{
    Task SendOtpAsync(string toEmail, string toName, string otp, OtpPurpose purpose, CancellationToken ct = default);
}
