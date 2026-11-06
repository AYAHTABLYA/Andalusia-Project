using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class ContactEnquiry
    {
        public long EnquiryId { get; set; }
        public long? UserId { get; set; }
        public long? HandledBy { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string MobileNumber { get; set; } = "";
        public ContactEnquirySubjectType SubjectType { get; set; } = ContactEnquirySubjectType.General;
        public string Message { get; set; } = "";
        public ContactEnquiryStatus Status { get; set; } = ContactEnquiryStatus.New;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public User? HandledByUser { get; set; }
    }
}