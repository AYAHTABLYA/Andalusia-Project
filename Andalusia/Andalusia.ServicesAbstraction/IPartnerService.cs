using Andalusia.Domain.Enums;
using Andalusia.Shared.Dtos.ProgramDtos;

namespace Andalusia.ServicesAbstraction;

public interface IPartnerService
{
    Task<IReadOnlyList<PartnerDto>> GetAllAsync(PartnerType? type, CancellationToken ct = default);
}
