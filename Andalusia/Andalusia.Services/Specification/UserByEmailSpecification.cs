using AndalusiaApp.Models;

namespace Andalusia.Services.Specification;

/// <param name="normalizedEmail">Trimmed + lower-cased email.</param>
public class UserByEmailSpecification : BaseSpecification<User>
{
    public UserByEmailSpecification(string normalizedEmail)
        : base(u => u.Email == normalizedEmail)
    {
    }
}
