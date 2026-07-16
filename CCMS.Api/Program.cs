using System.Text;
using CCMS.Api.Infrastructure.Repositories;
using CCMS.Api.Middleware;
using CCMS.Application.Services;
using CCMS.Domain.Entities;
using CCMS.Domain.Enums;
using CCMS.Infrastructure.Auth;
using CCMS.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// --- Existing services (controllers, DbContext, repositories, etc.) ---
// Preserve whatever is already registered here — this is additive only.
builder.Services.AddControllers();

// --- C-01: JWT authentication setup ---
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (builder.Environment.IsDevelopment() || builder.Environment.IsEnvironment("Testing"))
    {
        jwtKey = "dev-only-test-key-for-ccms-1234567890";
    }
    else
    {
        throw new InvalidOperationException("Jwt:Key missing from configuration.");
    }
}

builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"] ?? "CCMS",
            ValidAudience = jwtSection["Audience"] ?? "CCMS.Client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Default behavior returns an EMPTY 401/403 body. The frontend's api.js
        // reads `data.message`, so without this, users would just see
        // "Request failed with status 401" instead of a meaningful message.
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                // Fires when auth fails or is missing (not logged in / bad token).
                context.HandleResponse(); // suppress the default empty response
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "You must be logged in to access this resource."
                });
            },
            OnForbidden = async context =>
            {
                // Fires when the user IS authenticated but lacks the required role.
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "You do not have permission to access this resource."
                });
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<MySqlConnectionFactory>();
builder.Services.AddScoped<MysqlRepository>();
builder.Services.AddScoped<IAccountStatusRepository, InMemoryAccountStatusRepository>();
builder.Services.AddScoped<IClubMembershipRepository, InMemoryClubMembershipRepository>();
builder.Services.AddScoped<IEventRepository, InMemoryEventRepository>();
builder.Services.AddScoped<IClubMembershipService, ClubMembershipService>();
builder.Services.AddScoped<IEventDetailsService, EventDetailsService>();

var app = builder.Build();

// --- Middleware pipeline order matters here ---
app.UseHttpsRedirection();

app.UseAuthentication();       // 1. Who are you? (validates JWT, populates context.User)
app.UseDisabledAccountCheck(); // 2. Are you still allowed to be here? (per-request DB check)
app.UseAuthorization();        // 3. Are you allowed to do THIS? ([Authorize(Roles=...)])

app.MapControllers();

app.Run();

internal sealed class InMemoryAccountStatusRepository : IAccountStatusRepository
{
    public Task<bool> IsUserDisabledAsync(string userId)
    {
        return Task.FromResult(false);
    }
}

internal sealed class InMemoryClubMembershipRepository : IClubMembershipRepository
{
    public Task<bool> ClubExistsAndIsActiveAsync(int clubId)
    {
        return Task.FromResult(clubId > 0);
    }

    public Task<string> GetClubNameAsync(int clubId)
    {
        return Task.FromResult(clubId == 1 ? "AI Club" : "Sample Club");
    }

    public Task<ClubMembership?> FindExistingMembershipAsync(string userId, int clubId)
    {
        return Task.FromResult<ClubMembership?>(null);
    }

    public Task<ClubMembership> AddAsync(ClubMembership membership)
    {
        membership.Id = 1;
        return Task.FromResult(membership);
    }
}

internal sealed class InMemoryEventRepository : IEventRepository
{
    public Task<Event?> GetByIdAsync(int eventId)
    {
        if (eventId != 1)
        {
            return Task.FromResult<Event?>(null);
        }

        return Task.FromResult<Event?>(new Event
        {
            Id = 1,
            Title = "Sample Event",
            EventDateUtc = DateTime.UtcNow.AddDays(3),
            Location = "Room 101",
            Status = "Published"
        });
    }
}
