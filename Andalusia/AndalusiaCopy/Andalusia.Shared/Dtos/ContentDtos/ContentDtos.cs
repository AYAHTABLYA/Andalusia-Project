namespace Andalusia.Shared.Dtos.ContentDtos;

// ---------------- public ----------------

/// <param name="Initials">Computed from ClientName (e.g. "Eng. Omar Farouk" -> "OF"); used by the avatar circle when AvatarUrl is empty.</param>
public record TestimonialDto(
    long TestimonialId,
    string ClientName,
    string TitleOrRole,
    string QuoteText,
    string AvatarUrl,
    string Initials,
    int Rating,
    bool IsFeatured,
    long? CourseId,
    string? CourseTitle);

public record RatingBucketDto(int Stars, int Count);

/// <param name="AverageRating">Mean of all testimonial ratings, rounded to 1 decimal (0 when there are none).</param>
/// <param name="Distribution">Always 5 rows, from 5 stars down to 1 star.</param>
public record RatingSummaryDto(double AverageRating, int TotalCount, IReadOnlyList<RatingBucketDto> Distribution);

public record FaqDto(
    long FaqId,
    long? CategoryId,
    string? CategoryName,
    string Question,
    string Answer,
    int OrderIndex);

// ---------------- admin / content manager ----------------

/// <summary>Body for both POST and PUT /api/admin/testimonials. Rating must be 1-5.</summary>
public record UpsertTestimonialDto(
    string ClientName,
    string TitleOrRole,
    string QuoteText,
    int Rating,
    bool IsFeatured = false,
    string? AvatarUrl = null,
    long? CourseId = null);

public record AdminFaqDto(
    long FaqId,
    long? CategoryId,
    string? CategoryName,
    string Question,
    string Answer,
    int OrderIndex,
    bool IsActive);

/// <summary>
/// Body for both POST and PUT /api/admin/faqs. CategoryId = null means a general FAQ.
/// OrderIndex = null: on create it goes to the end of its category; on update it is kept
/// (or moved to the end if the category changed). OrderIndex must be unique per category.
/// </summary>
public record UpsertFaqDto(
    string Question,
    string Answer,
    long? CategoryId = null,
    int? OrderIndex = null,
    bool IsActive = true);
