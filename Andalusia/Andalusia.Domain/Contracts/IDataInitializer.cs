using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Domain.Contracts
{
    public interface IDataInitializer 
    {
        Task InitializeAsync();
    }
}
