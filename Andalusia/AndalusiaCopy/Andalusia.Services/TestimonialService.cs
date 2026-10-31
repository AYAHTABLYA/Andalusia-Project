using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.ContentDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace Andalusia.Services;

public sealed class TestimonialService(IUnitOfWork uow) : ITestimonialService
{
    private static readonly Error TestimonialNotFound =
        Error.NotFound("Testimonial.NotFound", "Testimonial not found.");

    public async Task<IReadOnlyList<TestimonialDto>> GetAllAsync(bool? featured, int? take, CancellationToken ct = default)
    {
        var items = await uow.GetRepository<Testimonial>()
            .GetAllAsync(new TestimonialsSpecification(featured, take), trackChanges: false);
        return items.Select(ToDto).ToList();
    }

    public async Task<RatingSummaryDto> GetRatingSummaryAsync(CancellationToken ct = default)
    {
        var ratings = (await uow.GetRepository<Testimonial>().GetAllAsync(trackChanges: false))
            .Select(t => t.Rating)
            .ToList();

        var average = ratings.Count == 0 ? 0d : Math.Round(ratings.Average(), 1);
        var distribution = Enumerable.Range(1, 5).Reverse()
            .Select(stars => new RatingBucketDto(stars, ratings.Count(r => r == stars)))
            .ToList();

        return new RatingSummaryDto(average, ratings.Count, distribution);
    }

    public async Task<Result<TestimonialDto>> GetAsync(long id, CancellationToken ct = default)
    {
        var entity = await uow.GetRepository<Testimonial>()
            .GetAsync(new TestimonialsSpecification(id), trackChanges: false);
        return entity is null
            ? Result<TestimonialDto>.Fail(TestimonialNotFound)
            : Result<TestimonialDto>.Ok(ToDto(entity));
    }

    public async Task<Result<TestimonialDto>> CreateAsync(UpsertTestimonialDto dto, CancellationToken ct = default)
    {
        if (Validate(dto) is { } invalid) return Result<TestimonialDto>.Fail(invalid);
        if (await CourseMissingAsync(dto.CourseId))
            return Result<TestimonialDto>.Fail(Error.NotFound("Course.NotFound", "Course not found."));

        var entity = new Testimonial();
        Apply(entity, dto);

        await uow.GetRepository<Testimonial>().AddAsync(entity);
        await uow.SaveChangesAsync();

        return await GetAsync(entity.TestimonialId, ct);
    }

    public async Task<Result<TestimonialDto>> UpdateAsync(long id, UpsertTestimonialDto dto, CancellationToken ct = default)
    {
        if (Validate(dto) is { } invalid) return Result<TestimonialDto>.Fail(invalid);

        var entity = await uow.GetRepository<Testimonial>()
            .GetAsync(new TestimonialsSpecification(id), trackChanges: true);
        if (entity is null) return Result<TestimonialDto>.Fail(TestimonialNotFound);

        if (await CourseMissingAsync(dto.CourseId))
            return Result<TestimonialDto>.Fail(Error.NotFound("Course.NotFound", "Course not found."));

        Apply(entity, dto);
        await uow.SaveChangesAsync();

        return await GetAsync(id, ct);
    }

    public async Task<Result> DeleteAsync(long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Testimonial>();
        var entity = await repo.GetByIdAsync(id);
        if (entity is null) return Result.Fail(TestimonialNotFound);

        repo.Remove(entity);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    // ------------------------------------------------------------------ helpers

    private async Task<bool> CourseMissingAsync(long? courseId)
        => courseId is { } id && await uow.GetRepository<Course>().GetByIdAsync(id) is null;

    private static void Apply(Testimonial entity, UpsertTestimonialDto dto)
    {
        entity.ClientName = dto.ClientName.Trim();
        entity.TitleOrRole = dto.TitleOrRole.Trim();
        entity.QuoteText = dto.QuoteText.Trim();
        entity.AvatarUrl = dto.AvatarUrl?.Trim() ?? "";
        entity.Rating = dto.Rating;
        entity.IsFeatured = dto.IsFeatured;
        entity.CourseId = dto.CourseId;
    }

    private static Error? Validate(UpsertTestimonialDto d)
    {
        if (string.IsNullOrWhiteSpace(d.ClientName) || d.ClientName.Trim().Length > 150)
            return Error.Validation("Testimonial.ClientName", "Client name is required (max 150 characters).");
        if (string.IsNullOrWhiteSpace(d.TitleOrRole) || d.TitleOrRole.Trim().Length > 150)
            return Error.Validation("Testimonial.TitleOrRole", "Title or role is required (max 150 characters).");
        if (string.IsNullOrWhiteSpace(d.QuoteText) || d.QuoteText.Trim().Length > 1000)
            return Error.Validation("Testimonial.QuoteText", "Quote is required (max 1000 characters).");
        if (d.Rating is < 1 or > 5)
            return Error.Validation("Testimonial.Rating", "Rating must be between 1 and 5.");
        if (d.AvatarUrl is { } avatar && avatar.Trim().Length > 500)
            return Error.Validation("Testimonial.AvatarUrl", "Avatar URL is too long (max 500 characters).");
        return null;
    }

    private static TestimonialDto ToDto(Testimonial t) => new(
        t.TestimonialId, t.ClientName, t.TitleOrRole, t.QuoteText, t.AvatarUrl,
        InitialsOf(t.ClientName), t.Rating, t.IsFeatured, t.CourseId, t.Course?.Title);

    /// <summary>"Eng. Omar Farouk" -> "OF" (honorifics ending with a dot are skipped).</summary>
    private static string InitialsOf(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var words = parts.Where(p => !p.EndsWith('.')).ToArray();
        if (words.Length == 0) words = parts;

        return string.Concat(words.Take(2).Select(w => char.ToUpperInvariant(w[0])));
    }
}
