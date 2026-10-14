using AndalusiaApp.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Models
{
    public class LearningOutcome
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public int Order { get; set; }

        public Course Course { get; set; } = null!;
    }
}
