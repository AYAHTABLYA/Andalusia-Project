namespace AndalusiaApp.Models
{
    public class Session
    {
        public long SessionId { get; set; }
        public long ScheduleId { get; set; }
        public string Title { get; set; } = "";
        public DateOnly SessionDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string RoomDetails { get; set; } = "";
        public Schedule Schedule { get; set; } = null!;



    }
}
