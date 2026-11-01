using System.Collections.Concurrent;
using Andalusia.ServicesAbstraction;

namespace Andalusia.Services;

/// <summary>Keeps revoked JWT ids (jti) until they expire. Register as Singleton.</summary>
public sealed class InMemoryTokenBlacklist : ITokenBlacklist
{
    private readonly ConcurrentDictionary<string, DateTime> _revoked = new();
    private DateTime _lastCleanup = DateTime.UtcNow;

    public void Revoke(string tokenId, DateTime expiresAtUtc)
    {
        Cleanup();
        _revoked[tokenId] = expiresAtUtc;
    }

    public bool IsRevoked(string tokenId)
    {
        Cleanup();
        return _revoked.ContainsKey(tokenId);
    }

    private void Cleanup()
    {
        var now = DateTime.UtcNow;
        if (now - _lastCleanup < TimeSpan.FromMinutes(10)) return;
        _lastCleanup = now;

        foreach (var item in _revoked)
        {
            if (item.Value < now)
                _revoked.TryRemove(item.Key, out _);
        }
    }
}
