namespace Andalusia.Shared.Dtos.ContactDtos;

/// <summary>Body of POST /api/contact-enquiries (the "Request Admission Interview" form).</summary>
/// <param name="Email">Optional on the form; stored as an empty string when missing.</param>
/// <param name="DesiredTrack">Selected track label; saved inside the enquiry message.</param>
/// <param name="Experience">Selected experience range; saved inside the enquiry message.</param>
public record CreateContactEnquiryDto(
    string FullName,
    string MobileNumber,
    string? Email = null,
    string? DesiredTrack = null,
    string? Experience = null);

public record ContactEnquiryReceiptDto(long EnquiryId, string Status);

// ---------------- admin ----------------

public record AdminContactEnquiryDto(
    long EnquiryId,
    string FullName,
    string Email,
    string MobileNumber,
    string SubjectType,
    string Message,
    string Status,
    DateTime CreatedAt,
    long? UserId,
    long? HandledBy);

/// <param name="Status">New | In_Progress | Resolved | Closed</param>
public record UpdateContactEnquiryStatusDto(string Status);
