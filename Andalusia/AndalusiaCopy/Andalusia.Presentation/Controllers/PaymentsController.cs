using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.PaymentDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize(Roles = Andalusia.Shared.Authorization.AppRoles.Learner)]
[Route("api/payments")]
public class PaymentsController(IPaymentService svc) : ControllerBase
{
    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    // GET /api/payments
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PaymentDto>>> GetMine(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Ok(await svc.GetMyPaymentsAsync(userId, ct));
    }

    // GET /api/payments/{id}
    [HttpGet("{id:long}")]
    public async Task<ActionResult<PaymentDto>> GetById(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return await svc.GetMyPaymentAsync(userId, id, ct) is { } dto ? Ok(dto) : NotFound();
    }

    // POST /api/payments   body: { "applicationId": 1 }
    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Initiate([FromBody] CreatePaymentDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return await svc.InitiateAsync(userId, dto, ct) is { } res ? Ok(res) : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Payment Conflict", Detail = ex.Message });
        }
    }

    // POST /api/payments/{id}/confirm   body: { "success": true }  (simulation callback)
    [HttpPost("{id:long}/confirm")]
    public async Task<ActionResult<PaymentDto>> Confirm(long id, [FromBody] ConfirmPaymentDto? dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return await svc.ConfirmAsync(userId, id, dto ?? new ConfirmPaymentDto(), ct) is { } res
                ? Ok(res)
                : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Payment Conflict", Detail = ex.Message });
        }
    }
}
