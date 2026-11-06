namespace Andalusia.ServicesAbstraction;

public interface ITokenBlacklist
{
    void Revoke(string tokenId, DateTime expiresAtUtc);
    bool IsRevoked(string tokenId);
}
