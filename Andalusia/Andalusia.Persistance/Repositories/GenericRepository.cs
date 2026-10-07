using Andalusia.Domain.Contracts;
using AndalusiaApp.Data;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Andalusia.Persistance.Repositories
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        private readonly AppDbContext _dbContext;

        public GenericRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync(bool trackChanges = false)
        {
            var query = _dbContext.Set<TEntity>();

            return trackChanges
                ? await query.ToListAsync()
                : await query.AsNoTracking().ToListAsync();
        }

        public async Task<TEntity?> GetByIdAsync(params object[] keyValues)
            => await _dbContext.Set<TEntity>().FindAsync(keyValues);

        public async Task AddAsync(TEntity entity)
            => await _dbContext.Set<TEntity>().AddAsync(entity);

        public void Update(TEntity entity)
            => _dbContext.Set<TEntity>().Update(entity);

        public void Remove(TEntity entity)
            => _dbContext.Set<TEntity>().Remove(entity);
        public async Task<IEnumerable<TEntity>> GetAllAsync(ISpecification<TEntity> specification, bool trackChanges = false)
        {
            var query = SpecificationEvaluator.CreateQuery(_dbContext.Set<TEntity>(), specification);

            if (!trackChanges)
                query = query.AsNoTracking();

            return await query.ToListAsync();
        }

        public async Task<TEntity?> GetAsync(ISpecification<TEntity> specification, bool trackChanges = false)
        {
            var query = SpecificationEvaluator.CreateQuery(_dbContext.Set<TEntity>(), specification);

            if (!trackChanges)
                query = query.AsNoTracking();

            return await query.FirstOrDefaultAsync();
        }

        public async Task<int> CountAsync(ISpecification<TEntity> specification)
            => await SpecificationEvaluator.CreateQuery(_dbContext.Set<TEntity>(), specification).CountAsync();
    }
}
