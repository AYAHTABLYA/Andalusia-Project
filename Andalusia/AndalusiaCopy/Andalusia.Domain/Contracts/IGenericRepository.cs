using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Contracts
{
    public interface IGenericRepository <TEntity> where TEntity : class 
    {
        Task<IEnumerable<TEntity>> GetAllAsync(bool trackChanges = false);
        Task<TEntity?> GetByIdAsync(params object[] keyValues);
        Task AddAsync(TEntity entity);
        void Update(TEntity entity);
        void Remove(TEntity entity);
        Task<IEnumerable<TEntity>> GetAllAsync(ISpecification<TEntity> specification, bool trackChanges = false);
        Task<TEntity?> GetAsync(ISpecification<TEntity> specification, bool trackChanges = false);
        Task<int> CountAsync(ISpecification<TEntity> specification);
    }
}
