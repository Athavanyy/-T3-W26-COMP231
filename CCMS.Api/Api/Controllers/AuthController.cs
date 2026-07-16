using System.ComponentModel.DataAnnotations;
using CCMS.Domain.Enums;
using CCMS.Infrastructure.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CCMS.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IJwtTokenService _jwtTokenService;

        public AuthController(IJwtTokenService jwtTokenService)
        {
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest(new { message = "Role is required." });
            }

            if (!TryParseRole(request.Role, out var role))
            {
                return BadRequest(new { message = "Unknown role." });
            }

            var token = _jwtTokenService.IssueToken("demo-user", "Demo User", role);
            return Ok(new { token, role = role.ToRoleString() });
        }

        private static bool TryParseRole(string roleValue, out UserRole role)
        {
            switch (roleValue.Trim().ToLowerInvariant())
            {
                case "student":
                    role = UserRole.Student;
                    return true;
                case "executive":
                case "club executive":
                case "clubexecutive":
                    role = UserRole.ClubExecutive;
                    return true;
                case "administrator":
                case "admin":
                    role = UserRole.Administrator;
                    return true;
                default:
                    role = default;
                    return false;
            }
        }
    }

    public sealed class LoginRequest
    {
        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
