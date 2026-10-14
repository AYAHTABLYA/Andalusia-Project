using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class MyPaymentsSpecification : BaseSpecification<Payment>
{
    public MyPaymentsSpecification(long userId) : base(p => p.UserId == userId)
    {
        AddOrderByDescending(p => p.PaymentId);
    }
}

public class MyPaymentSpecification : BaseSpecification<Payment>
{
    public MyPaymentSpecification(long userId, long id)
        : base(p => p.UserId == userId && p.PaymentId == id)
    {
    }
}

public class PaymentsByApplicationSpecification : BaseSpecification<Payment>
{
    public PaymentsByApplicationSpecification(long applicationId)
        : base(p => p.ApplicationId == applicationId)
    {
    }
}

public class ActiveEnrollmentForTargetSpecification : BaseSpecification<Enrollment>
{
    public ActiveEnrollmentForTargetSpecification(long userId, long? courseId, long? programId, long? scheduleId)
        : base(e => e.UserId == userId
                    && e.Status != EnrollmentStatus.Cancelled
                    && e.CourseId == courseId
                    && e.ProgramId == programId
                    && e.ScheduleId == scheduleId)
    {
    }
}

public class ScheduleEnrollmentsSpecification : BaseSpecification<Enrollment>
{
    public ScheduleEnrollmentsSpecification(long scheduleId)
        : base(e => e.ScheduleId == scheduleId && e.Status != EnrollmentStatus.Cancelled)
    {
    }
}

public class UserRolesByUserSpecification : BaseSpecification<UserRole>
{
    public UserRolesByUserSpecification(long userId) : base(ur => ur.UserId == userId)
    {
        AddInclude(ur => ur.Role);
    }
}
