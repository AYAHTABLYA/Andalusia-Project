using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public sealed class ContactEnquiriesSpecification : BaseSpecification<ContactEnquiry>
{
    // List: newest first, optional status filter.
    public ContactEnquiriesSpecification(ContactEnquiryStatus? status)
        : base(e => status == null || e.Status == status)
    {
        AddOrderByDescending(e => e.CreatedAt);
    }

    // Single row by id.
    public ContactEnquiriesSpecification(long id) : base(e => e.EnquiryId == id)
    {
    }
}
