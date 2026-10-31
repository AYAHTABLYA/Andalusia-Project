using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public sealed class FaqsSpecification : BaseSpecification<Faq>
{
    public FaqsSpecification(string? categorySlug, bool generalOnly, bool activeOnly)
        : base(f => (!activeOnly || f.IsActive)
                    && (!generalOnly || f.CategoryId == null)
                    && (categorySlug == null || (f.Category != null && f.Category.Slug == categorySlug)))
    {
        AddInclude(f => f.Category!);
        AddOrderBy(f => f.OrderIndex);
    }

    public FaqsSpecification(long id) : base(f => f.FaqId == id)
    {
        AddInclude(f => f.Category!);
    }
}

/// <summary>All FAQs in one category scope (null = general), used to check/assign the unique OrderIndex.</summary>
public sealed class FaqScopeSpecification : BaseSpecification<Faq>
{
    public FaqScopeSpecification(long? categoryId, long? excludeFaqId)
        : base(f => f.CategoryId == categoryId && (excludeFaqId == null || f.FaqId != excludeFaqId))
    {
    }
}
