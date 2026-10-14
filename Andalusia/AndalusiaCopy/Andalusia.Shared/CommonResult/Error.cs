using System;
using System.Collections.Generic;
using System.Text;
namespace Andalusia.Shared.CommonResult;
public class Error
{
    private Error(string code, string description, ErrorType type)
    {
        Code = code;
        Description = description;
        Type = type;
    }

    public string Code { get; }
    public string Description { get; }
    public ErrorType Type { get; }

    public static Error Failure(string code = "General.Failure", string description = "A failure has occurred.")
        => new(code, description, ErrorType.Failure);

    public static Error Validation(string code = "General.Validation", string description = "A validation error has occurred.")
        => new(code, description, ErrorType.Validation);

    public static Error NotFound(string code = "General.NotFound", string description = "The requested resource was not found.")
        => new(code, description, ErrorType.NotFound);

    public static Error Unauthorized(string code = "General.Unauthorized", string description = "You are not authorized.")
        => new(code, description, ErrorType.Unauthorized);

    public static Error Forbidden(string code = "General.Forbidden", string description = "You do not have permission to do this.")
        => new(code, description, ErrorType.Forbidden);

    public static Error InvalidCredentials(string code = "General.InvalidCredentials", string description = "Invalid credentials.")
        => new(code, description, ErrorType.InvalidCredentials);
}
