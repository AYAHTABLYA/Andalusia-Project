using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Contracts
{
    public interface IUnitOfWork 
    {
        IGenericRepository<TEntity> GetRepository<TEntity>() where TEntity : class;
        Task<int> SaveChangesAsync();
    }
}
