using Andalusia.Domain.Enums;
using AndalusiaApp.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Models
{
    public class CourseApplication
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public long? UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Course Course { get; set; } = null!;
        public User? User { get; set; }
    }
}
