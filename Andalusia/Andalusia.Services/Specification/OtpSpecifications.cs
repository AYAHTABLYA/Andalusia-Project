using AndalusiaApp.Models;

namespace Andalusia.Services.Specification;

// ---- Email confirmation OTPs ----
public class EmailOtpsByUserSpecification : BaseSpecification<EmailVerificationToken>
{
    public EmailOtpsByUserSpecification(long userId) : base(t => t.UserId == userId)
    {
        AddOrderByDescending(t => t.CreatedAt);
    }
}

public class ValidEmailOtpSpecification : BaseSpecification<EmailVerificationToken>
{
    public ValidEmailOtpSpecification(long userId, string otpHash, DateTime nowUtc)
        : base(t => t.UserId == userId
                    && t.Token == otpHash
                    && t.VerifiedAt == null
                    && t.ExpiresAt > nowUtc)
    {
    }
}

// ---- Password reset OTPs ----
public class ResetOtpsByUserSpecification : BaseSpecification<PasswordResetToken>
{
    public ResetOtpsByUserSpecification(long userId) : base(t => t.UserId == userId)
    {
        AddOrderByDescending(t => t.CreatedAt);
    }
}

public class ValidResetOtpSpecification : BaseSpecification<PasswordResetToken>
{
    public ValidResetOtpSpecification(long userId, string otpHash, DateTime nowUtc)
        : base(t => t.UserId == userId
                    && t.Token == otpHash
                    && t.UsedAt == null
                    && t.ExpiresAt > nowUtc)
    {
    }
}
