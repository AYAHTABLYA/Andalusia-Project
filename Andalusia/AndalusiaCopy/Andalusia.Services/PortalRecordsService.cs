using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.PortalDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Services;

public sealed class PortalRecordsService(IUnitOfWork uow) : IPortalRecordsService
{
    public async Task<IReadOnlyList<EnrollmentDto>> GetMyEnrollmentsAsync(long userId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var items = await uow.GetRepository<Enrollment>()
            .GetAllAsync(new MyEnrollmentsSpecification(userId), trackChanges: false);

        return items.Select(ToDto).ToList();
    }

    public async Task<EnrollmentDto?> GetMyEnrollmentAsync(long userId, long id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var item = await uow.GetRepository<Enrollment>()
            .GetAsync(new MyEnrollmentSpecification(userId, id), trackChanges: false);

        return item is null ? null : ToDto(item);
    }

    public async Task<IReadOnlyList<ApplicationDto>> GetMyApplicationsAsync(long userId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var items = await uow.GetRepository<Application>()
            .GetAllAsync(new MyApplicationsSpecification(userId), trackChanges: false);

        return items.Select(ToDto).ToList();
    }

    public async Task<ApplicationDto?> GetMyApplicationAsync(long userId, long id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var item = await uow.GetRepository<Application>()
            .GetAsync(new MyApplicationSpecification(userId, id), trackChanges: false);

        return item is null ? null : ToDto(item);
    }

    public async Task<bool> CancelMyApplicationAsync(long userId, long id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var application = await uow.GetRepository<Application>()
            .GetAsync(new MyApplicationSpecification(userId, id), trackChanges: true);

        if (application is null)
            return false;

        if (application.Status is ApplicationStatus.Approved
            or ApplicationStatus.Rejected
            or ApplicationStatus.Cancelled)
        {
            throw new InvalidOperationException("This application can no longer be cancelled.");
        }

        application.Status = ApplicationStatus.Cancelled;
        await uow.SaveChangesAsync();
        return true;
    }

    private static EnrollmentDto ToDto(Enrollment x) => new(
        x.EnrollmentId, x.Status.ToString(), x.EnrolledAt,
        x.CourseId, x.Course?.Title,
        x.ProgramId, x.Program?.Title,
        x.ScheduleId, x.ApplicationId);

    private static ApplicationDto ToDto(Application x) => new(
        x.ApplicationId, x.Status.ToString(), x.SubmissionDate,
        x.CourseId, x.Course?.Title,
        x.ProgramId, x.Program?.Title,
        x.ScheduleId);
}
