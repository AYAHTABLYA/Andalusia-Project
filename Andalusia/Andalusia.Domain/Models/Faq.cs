namespace AndalusiaApp.Models
{
    public class Faq
    {

        public long FaqId { get; set; }
        public long? CategoryId { get; set; }
        public string Question { get; set; } = "";
        public string Answer { get; set; } = "";
        public int OrderIndex { get; set; }
        public bool IsActive { get; set; } = true;
        public Category? Category { get; set; }






    }
}
