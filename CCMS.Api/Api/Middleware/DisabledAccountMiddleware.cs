using System.Security.Claims;

namespace CCMS.Api.Middleware
{
    /// <summary>
    /// Minimal read-only contract this middleware needs. Wire this up to whatever
    /// user repository/DbContext already exists in the project (Repository pattern
    /// preserved — this does NOT introduce a new data access approach).
    /// </summary>
    public interface IAccountStatusRepository
    {
        Task<bool> IsUserDisabledAsync(string userId);
    }

    /// <summary>
    /// C-01 requirement: "Disabled users cannot access protected resources."
    /// A JWT is only checked at issuance, so if we relied on the token alone,
    /// a user disabled mid-session would keep working until token expiry.
    /// This middleware re-checks disabled status on every authenticated request.
    /// </summary>
    public class DisabledAccountMiddleware
    {
        private readonly RequestDelegate _next;

        public DisabledAccountMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAccountStatusRepository accountStatusRepository)
        {
            // Only relevant for authenticated requests. Anonymous endpoints
            // (login, public pages) skip straight through.
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? context.User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(userId))
                {
                    await WriteJsonError(context, StatusCodes.Status401Unauthorized,
                        "Invalid session. Please log in again.");
                    return;
                }

                var isDisabled = await accountStatusRepository.IsUserDisabledAsync(userId);
                if (isDisabled)
                {
                    await WriteJsonError(context, StatusCodes.Status403Forbidden,
                        "This account has been disabled. Contact an administrator for assistance.");
                    return;
                }
            }

            await _next(context);
        }

        private static async Task WriteJsonError(HttpContext context, int statusCode, string message)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { message });
        }
    }

    public static class DisabledAccountMiddlewareExtensions
    {
        public static IApplicationBuilder UseDisabledAccountCheck(this IApplicationBuilder app)
        {
            return app.UseMiddleware<DisabledAccountMiddleware>();
        }
    }
}
