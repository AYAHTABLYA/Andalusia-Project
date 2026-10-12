using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.ServicesAbstraction
{

    public enum OtpPurpose
    {
        EmailVerification,
        Login,
        PasswordReset
    }

    public interface IEmailService
    {
        Task SendOtpAsync(string toEmail, string toName, string otp, OtpPurpose purpose, CancellationToken ct = default);
    }
}
