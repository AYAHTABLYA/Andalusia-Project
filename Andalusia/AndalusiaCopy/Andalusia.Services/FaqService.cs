using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.ContentDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace Andalusia.Services;

public sealed class FaqService(IUnitOfWork uow) : IFaqService
{
    private static readonly Error FaqNotFound = Error.NotFound("Faq.NotFound", "FAQ not found.");

    // ------------------------------------------------------------------ public

    public async Task<IReadOnlyList<FaqDto>> GetAllAsync(string? categorySlug, bool generalOnly, CancellationToken ct = default)
    {
        var faqs = await uow.GetRepository<Faq>()
            .GetAllAsync(new FaqsSpecification(categorySlug, generalOnly, activeOnly: true), trackChanges: false);

        return Ordered(faqs)
            .Select(f => new FaqDto(f.FaqId, f.CategoryId, f.Category?.Name, f.Question, f.Answer, f.OrderIndex))
            .ToList();
    }

    // ------------------------------------------------------------------ admin

    public async Task<IReadOnlyList<AdminFaqDto>> GetAdminAllAsync(CancellationToken ct = default)
    {
        var faqs = await uow.GetRepository<Faq>()
            .GetAllAsync(new FaqsSpecification(null, generalOnly: false, activeOnly: false), trackChanges: false);
        return Ordered(faqs).Select(ToAdminDto).ToList();
    }

    public async Task<Result<AdminFaqDto>> GetAdminAsync(long id, CancellationToken ct = default)
    {
        var faq = await uow.GetRepository<Faq>().GetAsync(new FaqsSpecification(id), trackChanges: false);
        return faq is null ? Result<AdminFaqDto>.Fail(FaqNotFound) : Result<AdminFaqDto>.Ok(ToAdminDto(faq));
    }

    public async Task<Result<AdminFaqDto>> CreateAsync(UpsertFaqDto dto, CancellationToken ct = default)
    {
        if (Validate(dto) is { } invalid) return Result<AdminFaqDto>.Fail(invalid);
        if (await CategoryMissingAsync(dto.CategoryId))
            return Result<AdminFaqDto>.Fail(Error.NotFound("Category.NotFound", "Category not found."));

        var order = await ResolveOrderAsync(dto.CategoryId, excludeFaqId: null, requested: dto.OrderIndex);
        if (order.IsFailure) return Result<AdminFaqDto>.Fail(order.Errors);

        var entity = new Faq
        {
            CategoryId = dto.CategoryId,
            Question = dto.Question.Trim(),
            Answer = dto.Answer.Trim(),
            OrderIndex = order.Value,
            IsActive = dto.IsActive
        };

        await uow.GetRepository<Faq>().AddAsync(entity);
        await uow.SaveChangesAsync();

        return await GetAdminAsync(entity.FaqId, ct);
    }

    public async Task<Result<AdminFaqDto>> UpdateAsync(long id, UpsertFaqDto dto, CancellationToken ct = default)
    {
        if (Validate(dto) is { } invalid) return Result<AdminFaqDto>.Fail(invalid);

        var entity = await uow.GetRepository<Faq>().GetAsync(new FaqsSpecification(id), trackChanges: true);
        if (entity is null) return Result<AdminFaqDto>.Fail(FaqNotFound);

        if (await CategoryMissingAsync(dto.CategoryId))
            return Result<AdminFaqDto>.Fail(Error.NotFound("Category.NotFound", "Category not found."));

        var categoryChanged = entity.CategoryId != dto.CategoryId;
        var orderChanged = dto.OrderIndex is { } o && o != entity.OrderIndex;

        // Only touch OrderIndex when it can collide: the category moved or a different order was asked for.
        if (categoryChanged || orderChanged)
        {
            var order = await ResolveOrderAsync(dto.CategoryId, excludeFaqId: id, requested: dto.OrderIndex);
            if (order.IsFailure) return Result<AdminFaqDto>.Fail(order.Errors);
            entity.OrderIndex = order.Value;
        }

        entity.CategoryId = dto.CategoryId;
        entity.Question = dto.Question.Trim();
        entity.Answer = dto.Answer.Trim();
        entity.IsActive = dto.IsActive;

        await uow.SaveChangesAsync();
        return await GetAdminAsync(id, ct);
    }

    public async Task<Result> DeleteAsync(long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Faq>();
        var entity = await repo.GetByIdAsync(id);
        if (entity is null) return Result.Fail(FaqNotFound);

        repo.Remove(entity);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    // ------------------------------------------------------------------ helpers

    private async Task<bool> CategoryMissingAsync(long? categoryId)
        => categoryId is { } id && await uow.GetRepository<Category>().GetByIdAsync(id) is null;

    /// <summary>OrderIndex is unique per category (null category = general). No request = next free slot.</summary>
    private async Task<Result<int>> ResolveOrderAsync(long? categoryId, long? excludeFaqId, int? requested)
    {
        var scope = (await uow.GetRepository<Faq>()
            .GetAllAsync(new FaqScopeSpecification(categoryId, excludeFaqId), trackChanges: false)).ToList();

        if (requested is { } wanted)
        {
            return scope.Any(f => f.OrderIndex == wanted)
                ? Result<int>.Fail(Error.Conflict("Faq.OrderIndex",
                    "Another FAQ in this category already uses this order index."))
                : Result<int>.Ok(wanted);
        }

        return Result<int>.Ok(scope.Count == 0 ? 1 : scope.Max(f => f.OrderIndex) + 1);
    }

    private static IEnumerable<Faq> Ordered(IEnumerable<Faq> faqs) => faqs
        .OrderBy(f => f.CategoryId.HasValue) // general first
        .ThenBy(f => f.CategoryId)
        .ThenBy(f => f.OrderIndex);

    private static Error? Validate(UpsertFaqDto d)
    {
        if (string.IsNullOrWhiteSpace(d.Question) || d.Question.Trim().Length > 500)
            return Error.Validation("Faq.Question", "Question is required (max 500 characters).");
        if (string.IsNullOrWhiteSpace(d.Answer) || d.Answer.Trim().Length > 2000)
            return Error.Validation("Faq.Answer", "Answer is required (max 2000 characters).");
        if (d.OrderIndex is < 1)
            return Error.Validation("Faq.OrderIndex", "Order index must be 1 or more.");
        return null;
    }

    private static AdminFaqDto ToAdminDto(Faq f) =>
        new(f.FaqId, f.CategoryId, f.Category?.Name, f.Question, f.Answer, f.OrderIndex, f.IsActive);
}
