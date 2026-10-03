namespace AndalusiaApp.Models
{
    public class Testimonial
    {

        public long TestimonialId { get; set; }
        public long? UserId { get; set; }
        public long? CourseId { get; set; }
        public string ClientName { get; set; } = "";
        public string TitleOrRole { get; set; } = "";
        public string QuoteText { get; set; } = "";
        public string AvatarUrl { get; set; } = "";
        public bool IsFeatured { get; set; }

        public User User { get; set; } = null!;
        public Course Course { get; set; } = null!;

    }
}
