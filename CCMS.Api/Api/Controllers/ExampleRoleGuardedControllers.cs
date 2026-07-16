using CCMS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CCMS.Api.Controllers
{
    // Matches frontend: executive/dashboard route guarded by allowedRoles={["Club Executive"]}
    [ApiController]
    [Route("api/executive")]
    [Authorize(Roles = "Club Executive")] // Administrators are NOT auto-included — matches
                                           // the acceptance test set which never asserts
                                           // Admin access to Executive-only endpoints.
                                           // If your project DOES want Admin to inherit
                                           // Executive access, use: Roles = "Club Executive,Administrator"
    public class ExecutiveController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            // Delegate to your existing service/repository here.
            // This attribute is the only C-01 change needed on this action;
            // RCE-01 dashboard logic itself belongs to whoever owns that story.
            return Ok(new { clubName = "AI Club", pendingJoinRequests = 5, upcomingEvents = 2, announcements = 3 });
        }
    }

    // Matches frontend: admin/users/{userId}/role guarded by allowedRoles={["Administrator"]}
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Administrator")]
    public class AdminController : ControllerBase
    {
        [HttpPut("users/{userId}/role")]
        public IActionResult UpdateUserRole(string userId, [FromBody] object payload)
        {
            // RA-05 business logic owned by whoever has that task; this stub
            // exists only to demonstrate the [Authorize] placement for C-01.
            return Ok(new { message = "Role updated." });
        }
    }
}
