using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class PartnersSpecification : BaseSpecification<Partner>
{
    public PartnersSpecification(PartnerType? type)
        : base(p => p.IsActive && (type == null || p.Type == type))
    {
        AddOrderBy(p => p.PartnerId);
    }
}
