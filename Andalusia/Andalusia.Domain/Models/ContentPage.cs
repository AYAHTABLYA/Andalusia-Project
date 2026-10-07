namespace AndalusiaApp.Models
{
    public class ContentPage
    {


        public long PageId { get; set; }
        public string PageKey { get; set; } = "";
        public string SectionKey { get; set; } = "";
        public string ContentPayload { get; set; } = "";
        public long UpdatedBy { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public User UpdatedByUser { get; set; } = null!;







    }
}
