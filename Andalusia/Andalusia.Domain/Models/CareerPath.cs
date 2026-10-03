namespace AndalusiaApp.Models;
public class CareerPath
{
    public long CareerPathId { get; set; }
    public string Title { get; set; } = "";
    public string Overview { get; set; } = "";
    public string RecommendedSkills { get; set; } = "";
    public string LearningJourney { get; set; } = "";
    public string Status { get; set; } = "";
    public ICollection<Program> Programs { get; set; } = new List<Program>();
}