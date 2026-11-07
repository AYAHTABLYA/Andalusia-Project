using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ProgramDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace AndalusiaApp.Services;

public class PartnerService(IUnitOfWork uow) : IPartnerService
{
    public async Task<IReadOnlyList<PartnerDto>> GetAllAsync(PartnerType? type, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Partner>();
        var partners = await repo.GetAllAsync(new PartnersSpecification(type), trackChanges: false);

        return partners
            .Select(p => new PartnerDto(p.PartnerId, p.Name, p.LogoUrl, p.Type.ToString()))
            .ToList();
    }
}
