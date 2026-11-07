using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.StaffDtos;

namespace Andalusia.ServicesAbstraction;

/// <summary>Course materials, assignments and submission grading, shared by Admin and Instructor.</summary>
public interface IStaffContentService
{
    Task<Result<IReadOnlyList<StaffMaterialDto>>> GetMaterialsAsync(StaffActor actor, long courseId, long? scheduleId, CancellationToken ct = default);
    Task<Result<StaffMaterialDto>> GetMaterialAsync(StaffActor actor, long id, CancellationToken ct = default);
    Task<Result<StaffMaterialDto>> CreateMaterialAsync(StaffActor actor, long courseId, CreateMaterialDto dto, CancellationToken ct = default);
    Task<Result<StaffMaterialDto>> UpdateMaterialAsync(StaffActor actor, long id, UpdateMaterialDto dto, CancellationToken ct = default);
    Task<Result> DeleteMaterialAsync(StaffActor actor, long id, CancellationToken ct = default);

    Task<Result<StaffAssignmentDto>> GetAssignmentAsync(StaffActor actor, long id, CancellationToken ct = default);
    Task<Result<StaffAssignmentDto>> CreateAssignmentAsync(StaffActor actor, CreateAssignmentDto dto, CancellationToken ct = default);
    Task<Result<StaffAssignmentDto>> UpdateAssignmentAsync(StaffActor actor, long id, UpdateAssignmentDto dto, CancellationToken ct = default);
    Task<Result> DeleteAssignmentAsync(StaffActor actor, long id, CancellationToken ct = default);

    Task<Result<StaffSubmissionDto>> GradeSubmissionAsync(StaffActor actor, long submissionId, GradeSubmissionDto dto, CancellationToken ct = default);
}
