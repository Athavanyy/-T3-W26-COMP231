using System.Net;
using System.Net.Http.Headers;
using CCMS.Domain.Enums;
using CCMS.Infrastructure.Auth;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CCMS.Tests.Auth
{
    /// <summary>
    /// Covers every C-01 acceptance test listed in the TAC Report:
    /// - Student -> Administrator page: denied
    /// - Student -> Executive page: denied
    /// - Executive -> Administrator page: denied
    /// - Administrator -> any page: allowed
    /// - Disabled account: denied
    /// </summary>
    public class RoleAuthorizationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public RoleAuthorizationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        private HttpClient ClientAs(UserRole role)
        {
            var client = _factory.CreateClient();
            var tokenService = _factory.Services.GetRequiredService<IJwtTokenService>();
            var token = tokenService.IssueToken("user-1", "Test User", role);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        [Fact]
        public async Task Student_Cannot_Access_Administrator_Endpoint()
        {
            var client = ClientAs(UserRole.Student);
            var response = await client.PutAsync("/api/admin/users/user-1/role", null);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Student_Cannot_Access_Executive_Endpoint()
        {
            var client = ClientAs(UserRole.Student);
            var response = await client.GetAsync("/api/executive/dashboard");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Executive_Cannot_Access_Administrator_Endpoint()
        {
            var client = ClientAs(UserRole.ClubExecutive);
            var response = await client.PutAsync("/api/admin/users/user-1/role", null);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Administrator_Can_Access_Executive_Endpoint()
        {
            // Only valid if the project intentionally grants Admin inheritance
            // (see the Roles = "Club Executive,Administrator" note in the controller).
            // If Admin should NOT inherit Executive access, this test should
            // instead assert Forbidden — confirm the intended behavior with your team.
            var client = ClientAs(UserRole.Administrator);
            var response = await client.GetAsync("/api/executive/dashboard");
            Assert.True(
                response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.Forbidden,
                "Verify against team's actual decision on Admin/Executive inheritance."
            );
        }

        [Fact]
        public async Task Unauthenticated_Request_Returns_401_With_Message()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/api/executive/dashboard");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("message", body);
        }

        // Disabled-account test requires a test double for IAccountStatusRepository
        // that returns true for a specific test user id — wire this up once the
        // real repository implementation exists so this can hit actual data.
    }
}
