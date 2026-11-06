using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class MyApplicationsSpecification : BaseSpecification<Application>
{
    public MyApplicationsSpecification(long userId)
        : base(x => x.UserId == userId)
    {
        AddInclude(x => x.Course!);
        AddInclude(x => x.Program!);
        AddOrderByDescending(x => x.SubmissionDate);
    }
}
