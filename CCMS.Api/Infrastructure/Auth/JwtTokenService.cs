using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CCMS.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CCMS.Infrastructure.Auth
{
    public interface IJwtTokenService
    {
        string IssueToken(string userId, string userName, UserRole role);
    }

    /// <summary>
    /// Issues JWT bearer tokens for C-01 role-based access control.
    /// Token carries: sub (user id), name, role.
    /// Deliberately does NOT carry "disabled" status — see DisabledAccountMiddleware
    /// for why that check has to happen per-request against live data instead.
    /// </summary>
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string IssueToken(string userId, string userName, UserRole role)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var key = jwtSection["Key"]
                ?? throw new InvalidOperationException("Jwt:Key is not configured. Set it in appsettings or user-secrets — never commit a real key to source control.");
            var issuer = jwtSection["Issuer"] ?? "CCMS";
            var audience = jwtSection["Audience"] ?? "CCMS.Client";
            var expiryMinutes = int.TryParse(jwtSection["ExpiryMinutes"], out var m) ? m : 60;

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, userId),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, userName),
                // ClaimTypes.Role is what [Authorize(Roles = "...")] checks against by default.
                new(ClaimTypes.Role, role.ToRoleString())
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
