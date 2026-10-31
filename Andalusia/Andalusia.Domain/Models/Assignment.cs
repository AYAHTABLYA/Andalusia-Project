namespace AndalusiaApp.Models
{
    public class Assignment
    {
        public long AssignmentId { get; set; }
        public long ScheduleId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime DueDate { get; set; }
        public int MaxScore { get; set; }
        public Schedule Schedule { get; set; } = null!;



    }
}
