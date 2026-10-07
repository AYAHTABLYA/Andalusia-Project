using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Andalusia.Domain.Contracts
{
    public interface ISpecification<TEntity> where TEntity : class
    {
        Expression<Func<TEntity, bool>>? Criteria { get; }
        List<Expression<Func<TEntity, object>>> IncludeExpressions { get; }
        Expression<Func<TEntity, object>>? OrderBy { get; }
        Expression<Func<TEntity, object>>? OrderByDescending { get; }
        int Skip { get; }
        int Take { get; }
        bool IsPaginated { get; }
    }
}
