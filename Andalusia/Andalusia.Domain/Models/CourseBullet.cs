using AndalusiaApp.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Models
{
    public class CourseBullet
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string Text { get; set; } = string.Empty;

        public Course Course { get; set; } = null!;
    }
}
