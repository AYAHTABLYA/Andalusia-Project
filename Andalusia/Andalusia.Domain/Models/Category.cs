namespace AndalusiaApp.Models;


public class Category
{
    public long CategoryId { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public bool IsTrending { get; set; }
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Program> Programs { get; set; } = new List<Program>();
    public ICollection<Faq> Faqs { get; set; } = new List<Faq>();
}
