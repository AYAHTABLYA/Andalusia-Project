using Andalusia.Shared.Dtos.PortalDtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.ServicesAbstraction
{

    public interface IPortalRecordsService
    {
        Task<IReadOnlyList<EnrollmentDto>> GetMyEnrollmentsAsync(long userId, CancellationToken ct = default);
        Task<EnrollmentDto?> GetMyEnrollmentAsync(long userId, long id, CancellationToken ct = default);
        Task<IReadOnlyList<ApplicationDto>> GetMyApplicationsAsync(long userId, CancellationToken ct = default);
        Task<ApplicationDto?> GetMyApplicationAsync(long userId, long id, CancellationToken ct = default);
        Task<bool> CancelMyApplicationAsync(long userId, long id, CancellationToken ct = default);
    }


}
