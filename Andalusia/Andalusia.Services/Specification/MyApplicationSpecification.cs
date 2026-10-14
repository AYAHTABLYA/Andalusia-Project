using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class MyApplicationSpecification : BaseSpecification<Application>
{
    public MyApplicationSpecification(long userId, long id)
        : base(x => x.UserId == userId && x.ApplicationId == id)
    {
        AddInclude(x => x.Course!);
        AddInclude(x => x.Program!);
    }
}
