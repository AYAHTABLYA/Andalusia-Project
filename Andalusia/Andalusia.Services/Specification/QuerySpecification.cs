using System.Linq.Expressions;

namespace Andalusia.Services.Specification;

/// <summary>
/// Ad-hoc specification for one-off queries: <c>new QuerySpecification&lt;T&gt;(x => ...).Include(x => x.Nav).OrderByDesc(x => x.Id)</c>.
/// Keeps simple filters out of one-class-per-query boilerplate while still going through the repository/evaluator.
/// </summary>
public sealed class QuerySpecification<TEntity> : BaseSpecification<TEntity> where TEntity : class
{
    public QuerySpecification(Expression<Func<TEntity, bool>>? criteria = null) : base(criteria)
    {
    }

    public QuerySpecification<TEntity> Include(Expression<Func<TEntity, object>> include)
    {
        AddInclude(include);
        return this;
    }

    public QuerySpecification<TEntity> OrderByAsc(Expression<Func<TEntity, object>> orderBy)
    {
        AddOrderBy(orderBy);
        return this;
    }

    public QuerySpecification<TEntity> OrderByDesc(Expression<Func<TEntity, object>> orderBy)
    {
        AddOrderByDescending(orderBy);
        return this;
    }

    public QuerySpecification<TEntity> Page(int skip, int take)
    {
        ApplyPaging(skip, take);
        return this;
    }
}
