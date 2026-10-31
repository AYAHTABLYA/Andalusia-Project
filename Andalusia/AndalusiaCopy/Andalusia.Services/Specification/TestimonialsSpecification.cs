using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public sealed class TestimonialsSpecification : BaseSpecification<Testimonial>
{
    // List: newest first, optional featured filter and take.
    public TestimonialsSpecification(bool? featured, int? take)
        : base(t => featured == null || t.IsFeatured == featured)
    {
        AddInclude(t => t.Course);
        AddOrderByDescending(t => t.TestimonialId);

        if (take is { } n)
            ApplyPaging(0, Math.Clamp(n, 1, 50));
    }

    // Single row by id.
    public TestimonialsSpecification(long id) : base(t => t.TestimonialId == id)
    {
        AddInclude(t => t.Course);
    }
}
