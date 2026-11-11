using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.LearnerDtos;
using Andalusia.Shared.Dtos.StaffDtos;

namespace Andalusia.ServicesAbstraction;

/// <summary>
/// Learner-facing "my enrolled course" data. Every method is scoped to the calling learner:
/// an enrollment / assignment that isn't theirs behaves exactly like one that doesn't exist (404).
/// </summary>
public interface ILearnerCourseService
{
    Task<Result<LearnerEnrollmentCourseDto>> GetCourseAsync(long userId, long enrollmentId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<LearnerMaterialDto>>> GetMaterialsAsync(long userId, long enrollmentId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<LearnerSessionDto>>> GetSessionsAsync(long userId, long enrollmentId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<LearnerAssignmentDto>>> GetAssignmentsAsync(long userId, long enrollmentId, CancellationToken ct = default);
    Task<Result<LearnerAssignmentDetailDto>> GetAssignmentAsync(long userId, long assignmentId, CancellationToken ct = default);
    Task<Result<LearnerSubmissionDto>> SubmitAssignmentAsync(long userId, long assignmentId, SubmitAssignmentDto dto, CancellationToken ct = default);
    Task<Result<LearnerAttendanceDto>> GetAttendanceAsync(long userId, long enrollmentId, CancellationToken ct = default);
    Task<Result<StudentProgressDto>> GetProgressAsync(long userId, long enrollmentId, CancellationToken ct = default);
}
