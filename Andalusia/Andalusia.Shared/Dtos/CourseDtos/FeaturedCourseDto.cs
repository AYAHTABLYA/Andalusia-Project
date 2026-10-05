using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record FeaturedCourseDto(
      long Id,
      string Slug,
      string Title,
      string Description,
      string Category,
      string ModeLabel,
      string ModeVariant,
      string NextBatch,
      string Hall,
      string Duration,
      string Mentor,
      string InstructorTitle,
      decimal Tuition,
      string Seats
  );
}
