using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CourseQuery(
    string? Search,
    string? Category,
    int Page = 1,
    int PageSize = 12,
    // default | title_asc | title_desc | price_asc | price_desc
    string? Sort = null
);
}
