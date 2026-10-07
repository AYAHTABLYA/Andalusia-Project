using Andalusia.Domain.Contracts;
using AndalusiaApp.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Persistance.Data.DataSeed
{
    public class DataInitializer : IDataInitializer
    {
        private readonly AppDbContext _dbContext;

        public DataInitializer(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task InitializeAsync()
        {
            // TODO: seed data here later (roles, permissions, categories...)
            await Task.CompletedTask;
        }

    }
}


    
