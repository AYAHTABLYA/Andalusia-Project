using Andalusia.Domain.Contracts;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Andalusia.Persistance.Repositories
{
    public static class SpecificationEvaluator
    {
        public static IQueryable<TEntity> CreateQuery<TEntity>(
            IQueryable<TEntity> inputQuery,
            ISpecification<TEntity> specification) where TEntity : class
        {
            var query = inputQuery;

            if (specification.Criteria is not null)
                query = query.Where(specification.Criteria);

            query = specification.IncludeExpressions
                .Aggregate(query, (current, include) => current.Include(include));

            // Without this, AddInclude("Programs.Category") on a specification was silently ignored.
            query = specification.IncludeStrings
                .Aggregate(query, (current, path) => current.Include(path));

            IOrderedQueryable<TEntity>? ordered = null;
            if (specification.OrderBy is not null)
                ordered = query.OrderBy(specification.OrderBy);
            else if (specification.OrderByDescending is not null)
                ordered = query.OrderByDescending(specification.OrderByDescending);

            if (ordered is not null)
            {
                if (specification.ThenBy is not null)
                    ordered = ordered.ThenBy(specification.ThenBy);
                query = ordered;
            }

            if (specification.IsPaginated)
                query = query.Skip(specification.Skip).Take(specification.Take);

            return query;
        }
    }

    }
