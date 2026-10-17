using AndalusiaApp.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Models
{
    public class Mentor
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;

        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}
