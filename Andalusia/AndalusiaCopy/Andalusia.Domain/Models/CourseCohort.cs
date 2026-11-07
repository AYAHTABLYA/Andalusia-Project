using Andalusia.Domain.Enums;
using AndalusiaApp.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Models
{
    public class CourseCohort
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public DateOnly StartDate { get; set; }
        public int Capacity { get; set; }
        public int EnrolledCount { get; set; }
        public ScheduleStatus Status { get; set; } = ScheduleStatus.Scheduled;

        public Course Course { get; set; } = null!;
    }
}
