namespace Andalusia.ServicesAbstraction;

/// <summary>Credentials are correct but the email was never confirmed.</summary>
public class EmailNotConfirmedException(string email, bool codeSent = true)
    : Exception("Your email is not confirmed. Please confirm it first.")
{
    public string Email { get; } = email;

    /// <summary>False when a fresh code could not be emailed (SMTP problem).</summary>
    public bool CodeSent { get; } = codeSent;
}

/// <summary>An OTP was requested again before the cooldown ended.</summary>
public class OtpCooldownException(int secondsLeft)
    : Exception($"Please wait {secondsLeft} seconds before requesting a new code.")
{
    public int SecondsLeft { get; } = secondsLeft;
}

/// <summary>The OTP was created but the email could not be delivered (SMTP/provider problem).</summary>
public class OtpDeliveryException()
    : Exception("We couldn't send the code to your email right now. Please try again in a moment.");
