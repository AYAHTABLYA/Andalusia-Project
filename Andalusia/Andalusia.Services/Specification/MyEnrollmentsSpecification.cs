using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class MyEnrollmentsSpecification : BaseSpecification<Enrollment>
{
    public MyEnrollmentsSpecification(long userId)
        : base(x => x.UserId == userId)
    {
        AddInclude(x => x.Course!);
        AddInclude(x => x.Program!);
        AddOrderByDescending(x => x.EnrolledAt);
    }
}
