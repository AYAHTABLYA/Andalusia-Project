using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class MyEnrollmentSpecification : BaseSpecification<Enrollment>
{
    public MyEnrollmentSpecification(long userId, long id)
        : base(x => x.UserId == userId && x.EnrollmentId == id)
    {
        AddInclude(x => x.Course!);
        AddInclude(x => x.Program!);
    }
}
