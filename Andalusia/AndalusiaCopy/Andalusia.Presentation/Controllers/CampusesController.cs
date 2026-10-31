using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.AuthDtos;
using AndalusiaApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[ApiController]
[Route("api/campuses")]
public class CampusesController(IAuthService authService) : ControllerBase
{
    // GET /api/campuses
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CampusDto>>> GetCampuses(CancellationToken ct)
        => Ok(await authService.GetCampusesAsync(ct));
}