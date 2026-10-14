using Andalusia.Shared;
using Andalusia.Shared.Dtos.CourseDtos;

namespace AndalusiaApp.Services;

public interface ICourseService
{
    Task<PaginatedResult<CourseListItemDto>> GetAllAsync(CourseQuery query, CancellationToken ct = default);
    Task<string[]> GetCategoriesAsync(CancellationToken ct = default);
    Task<List<FeaturedCourseDto>> GetFeaturedAsync(int take = 3, CancellationToken ct = default);
    Task<CourseDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<long?> ApplyAsync(string slug, CreateApplicationDto dto, long? userId = null, CancellationToken ct = default);
    Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(string slug, CancellationToken ct = default);
}