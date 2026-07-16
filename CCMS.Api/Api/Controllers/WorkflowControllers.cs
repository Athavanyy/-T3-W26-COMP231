using System.Security.Claims;
using CCMS.Application.DTOs;
using CCMS.Application.Exceptions;
using CCMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CCMS.Api.Controllers
{
    [ApiController]
    public class WorkflowControllers : ControllerBase
    {
        private static string? GetUserId(ClaimsPrincipal user) =>
            user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");

        [HttpPost("api/clubs/{clubId}/join")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> JoinClub(int clubId, [FromServices] IClubMembershipService service)
        {
            var userId = GetUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { message = "You must be logged in to join a club." });
            }

            try
            {
                var result = await service.RequestJoinClubAsync(userId, new JoinClubRequestDto { ClubId = clubId });
                return Ok(result);
            }
            catch (ValidationFailedException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("api/events/{eventId}")]
        [Authorize(Roles = "Student,Club Executive,Administrator")]
        public async Task<IActionResult> GetEventDetails(int eventId, [FromServices] IEventDetailsService service)
        {
            try
            {
                var result = await service.GetEventDetailsAsync(eventId);
                return Ok(result);
            }
            catch (ValidationFailedException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
