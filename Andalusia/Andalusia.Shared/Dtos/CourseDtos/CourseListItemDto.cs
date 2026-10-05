using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CourseListItemDto(
    long Id,
    string Slug,
    string Title,
    string Category,
    string Type,
    string Duration,
    string Mentor,
    string Role,
    decimal Tuition,
    string Currency,
    string Seats
);
}
