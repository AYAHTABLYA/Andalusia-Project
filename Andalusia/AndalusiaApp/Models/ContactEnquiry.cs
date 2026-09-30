namespace AndalusiaApp.Models
{
    public class ContactEnquiry
    {

        public long EnquiryId { get; set; }
        public long? UserId { get; set; }    
        public long? HandledBy { get; set; }   // مين من الـ staff بيتعامل معاها (null لحد ما حد يستلمها)
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string MobileNumber { get; set; } = "";
        public string SubjectType { get; set; } = "General"; // General | Course | Program | Corporate
        public string Message { get; set; } = "";
        public string Status { get; set; } = "New"; // New | In_Progress | Resolved | Closed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public User? HandledByUser { get; set; }

    }
}
