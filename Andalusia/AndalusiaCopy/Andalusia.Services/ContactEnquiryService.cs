using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.ContactDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace Andalusia.Services;

public sealed class ContactEnquiryService(IUnitOfWork uow) : IContactEnquiryService
{
    // "+20 100 123 4567", "(03) 584-9020" ... digits with optional + ( ) - and spaces, at most 20 characters.
    private static readonly Regex PhonePattern = new(@"^\+?[0-9\s\-()]{6,20}$", RegexOptions.Compiled);

    private static readonly Error EnquiryNotFound = Error.NotFound("Enquiry.NotFound", "Enquiry not found.");

    // ------------------------------------------------------------------ public form

    public async Task<Result<ContactEnquiryReceiptDto>> SubmitAsync(
        CreateContactEnquiryDto dto, long? userId, CancellationToken ct = default)
    {
        if (Validate(dto) is { } invalid) return Result<ContactEnquiryReceiptDto>.Fail(invalid);

        var enquiry = new ContactEnquiry
        {
            UserId = userId,
            FullName = CollapseSpaces(dto.FullName),
            Email = dto.Email?.Trim() ?? "",
            MobileNumber = dto.MobileNumber.Trim(),
            SubjectType = ContactEnquirySubjectType.Program,
            Message = BuildMessage(dto),
            Status = ContactEnquiryStatus.New
        };

        await uow.GetRepository<ContactEnquiry>().AddAsync(enquiry);
        await uow.SaveChangesAsync();

        return Result<ContactEnquiryReceiptDto>.Ok(
            new ContactEnquiryReceiptDto(enquiry.EnquiryId, enquiry.Status.ToString()));
    }

    // ------------------------------------------------------------------ admin

    public async Task<Result<IReadOnlyList<AdminContactEnquiryDto>>> GetAdminAllAsync(
        string? status, CancellationToken ct = default)
    {
        ContactEnquiryStatus? filter = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!TryParseStatus(status, out var parsed))
                return Result<IReadOnlyList<AdminContactEnquiryDto>>.Fail(InvalidStatus);
            filter = parsed;
        }

        var items = await uow.GetRepository<ContactEnquiry>()
            .GetAllAsync(new ContactEnquiriesSpecification(filter), trackChanges: false);

        return Result<IReadOnlyList<AdminContactEnquiryDto>>.Ok(items.Select(ToAdminDto).ToList());
    }

    public async Task<Result<AdminContactEnquiryDto>> UpdateStatusAsync(
        long id, string status, long handledByUserId, CancellationToken ct = default)
    {
        if (!TryParseStatus(status, out var parsed))
            return Result<AdminContactEnquiryDto>.Fail(InvalidStatus);

        var enquiry = await uow.GetRepository<ContactEnquiry>()
            .GetAsync(new ContactEnquiriesSpecification(id), trackChanges: true);
        if (enquiry is null) return Result<AdminContactEnquiryDto>.Fail(EnquiryNotFound);

        enquiry.Status = parsed;
        enquiry.HandledBy = handledByUserId;
        await uow.SaveChangesAsync();

        return Result<AdminContactEnquiryDto>.Ok(ToAdminDto(enquiry));
    }

    // ------------------------------------------------------------------ helpers

    private static readonly Error InvalidStatus = Error.Validation(
        "Enquiry.Status", "Status must be one of: New, In_Progress, Resolved, Closed.");

    private static bool TryParseStatus(string value, out ContactEnquiryStatus status) =>
        Enum.TryParse(value.Trim(), ignoreCase: true, out status) && Enum.IsDefined(status);

    private static Error? Validate(CreateContactEnquiryDto d)
    {
        if (string.IsNullOrWhiteSpace(d.FullName) || d.FullName.Trim().Length > 150)
            return Error.Validation("Enquiry.FullName", "Full name is required (max 150 characters).");

        if (string.IsNullOrWhiteSpace(d.MobileNumber) || !PhonePattern.IsMatch(d.MobileNumber.Trim()))
            return Error.Validation("Enquiry.MobileNumber", "Enter a valid mobile / WhatsApp number (max 20 characters).");

        if (!string.IsNullOrWhiteSpace(d.Email))
        {
            var email = d.Email.Trim();
            if (email.Length > 255 || !MailAddress.TryCreate(email, out var parsed) || parsed.Address != email)
                return Error.Validation("Enquiry.Email", "Enter a valid email address.");
        }

        if (d.DesiredTrack is { } track && track.Trim().Length > 200)
            return Error.Validation("Enquiry.DesiredTrack", "Desired track is too long (max 200 characters).");
        if (d.Experience is { } experience && experience.Trim().Length > 200)
            return Error.Validation("Enquiry.Experience", "Experience is too long (max 200 characters).");

        return null;
    }

    // The form has no free-text field: the track and experience choices are kept in the message.
    private static string BuildMessage(CreateContactEnquiryDto d)
    {
        var sb = new StringBuilder("Admission interview request.");
        if (!string.IsNullOrWhiteSpace(d.DesiredTrack))
            sb.Append("\nDesired track: ").Append(d.DesiredTrack.Trim());
        if (!string.IsNullOrWhiteSpace(d.Experience))
            sb.Append("\nExperience: ").Append(d.Experience.Trim());
        return sb.ToString();
    }

    private static string CollapseSpaces(string value) =>
        string.Join(' ', value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

    private static AdminContactEnquiryDto ToAdminDto(ContactEnquiry e) => new(
        e.EnquiryId, e.FullName, e.Email, e.MobileNumber, e.SubjectType.ToString(),
        e.Message, e.Status.ToString(), e.CreatedAt, e.UserId, e.HandledBy);
}
