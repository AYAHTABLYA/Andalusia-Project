namespace Andalusia.ServicesAbstraction;

/// <summary>Credentials are correct but the email was never confirmed.</summary>
public class EmailNotConfirmedException(string email)
    : Exception("Your email is not confirmed. Please confirm it first.")
{
    public string Email { get; } = email;
}

/// <summary>An OTP was requested again before the cooldown ended.</summary>
public class OtpCooldownException(int secondsLeft)
    : Exception($"Please wait {secondsLeft} seconds before requesting a new code.")
{
    public int SecondsLeft { get; } = secondsLeft;
}
