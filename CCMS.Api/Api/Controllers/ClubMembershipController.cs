using System.Security.Claims;
using CCMS.Application.DTOs;
using CCMS.Application.Exceptions;
using CCMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CCMS.Api.Controllers
{
    // Matches frontend route: student/clubs/:clubId -> ClubDetails.jsx "Join Club" button
    [ApiController]
    [Route("api/clubs")]
    [Authorize(Roles = "Student")]
    public class ClubMembershipController : ControllerBase
    {
        private readonly IClubMembershipService _service;

        public ClubMembershipController(IClubMembershipService service)
        {
            _service = service;
        }

        [HttpPost("{clubId}/join")]
        public async Task<IActionResult> JoinClub(int clubId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "You must be logged in to join a club." });
            }

            try
            {
                var result = await _service.RequestJoinClubAsync(userId, new JoinClubRequestDto { ClubId = clubId });
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
            // Anything else (DB failure, unexpected exception) is intentionally NOT
            // caught here — it should bubble up to a global exception handler that
            // logs it and returns a generic 500 without internal details.
        }
    }
}
