using AndalusiaApp.Models;

namespace AndalusiaApp.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user, string roleName);
}