using System.Security.Claims;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ContactDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AndalusiaApp.Controllers;

/// <summary>Public "Request Admission Interview" form on the landing page (no sign-in needed).</summary>
[AllowAnonymous]
[EnableRateLimiting("contact")]
[Route("api/contact-enquiries")]
public sealed class ContactEnquiriesController(IContactEnquiryService svc) : StaffControllerBase
{
    // POST /api/contact-enquiries
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] CreateContactEnquiryDto dto, CancellationToken ct)
    {
        // Optional: link the enquiry to the account when the visitor happens to be signed in.
        long? userId = long.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out var id)
            ? id
            : null;

        // Career-path applications (sent by the career path page) are only accepted from signed-in users.
        if (userId is null &&
            dto.DesiredTrack?.TrimStart().StartsWith("Career path:", StringComparison.OrdinalIgnoreCase) == true)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Sign in required",
                Detail = "Please sign in first to apply for a career path."
            });
        }

        return ToCreated(await svc.SubmitAsync(dto, userId, ct));
    }
}
