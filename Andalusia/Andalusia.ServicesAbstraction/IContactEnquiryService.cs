using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.ContactDtos;

namespace Andalusia.ServicesAbstraction;

public interface IContactEnquiryService
{
    /// <summary>Public form submission. userId is set when the caller is signed in.</summary>
    Task<Result<ContactEnquiryReceiptDto>> SubmitAsync(CreateContactEnquiryDto dto, long? userId, CancellationToken ct = default);

    // admin
    Task<Result<IReadOnlyList<AdminContactEnquiryDto>>> GetAdminAllAsync(string? status, CancellationToken ct = default);
    Task<Result<AdminContactEnquiryDto>> UpdateStatusAsync(long id, string status, long handledByUserId, CancellationToken ct = default);
}
