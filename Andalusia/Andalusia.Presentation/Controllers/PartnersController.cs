using Andalusia.Domain.Enums;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ProgramDtos;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[ApiController]
[Route("api/partners")]
public class PartnersController(IPartnerService svc) : ControllerBase
{
    // GET /api/partners?type=Accreditation|Success_Partner   (type is optional)
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PartnerDto>>> GetAll(
        [FromQuery] string? type,
        CancellationToken ct)
    {
        PartnerType? parsed = null;
        if (!string.IsNullOrWhiteSpace(type))
        {
            if (!Enum.TryParse<PartnerType>(type.Trim(), ignoreCase: true, out var value))
                return BadRequest($"Unknown partner type '{type}'. Use Accreditation or Success_Partner.");
            parsed = value;
        }

        return Ok(await svc.GetAllAsync(parsed, ct));
    }
}
