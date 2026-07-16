using CCMS.Application.DTOs;
using CCMS.Application.Exceptions;
using CCMS.Application.Services;
using CCMS.Domain.Entities;
using CCMS.Domain.Enums;
using CCMS.Infrastructure.Repositories;
using Moq;
using Xunit;

namespace CCMS.Tests.ClubMembership
{
    /// <summary>
    /// Covers RS-07 acceptance tests from the TAC Report:
    /// - eligible student can request membership
    /// - duplicate requests rejected
    /// - existing members cannot request again
    /// - pending request stored
    /// - success confirmation displayed (verified at controller/DTO level, not here)
    /// </summary>
    public class JoinClubTests
    {
        private readonly Mock<IClubMembershipRepository> _repo = new();

        private ClubMembershipService BuildService() => new(_repo.Object);

        [Fact]
        public async Task EligibleStudent_Can_Request_Membership()
        {
            _repo.Setup(r => r.ClubExistsAndIsActiveAsync(1)).ReturnsAsync(true);
            _repo.Setup(r => r.FindExistingMembershipAsync("student-1", 1)).ReturnsAsync((CCMS.Domain.Entities.ClubMembership?)null);
            _repo.Setup(r => r.AddAsync(It.IsAny<CCMS.Domain.Entities.ClubMembership>()))
                .ReturnsAsync((CCMS.Domain.Entities.ClubMembership m) => { m.Id = 42; return m; });
            _repo.Setup(r => r.GetClubNameAsync(1)).ReturnsAsync("AI Club");

            var service = BuildService();
            var result = await service.RequestJoinClubAsync("student-1", new JoinClubRequestDto { ClubId = 1 });

            Assert.Equal(42, result.RequestId);
            Assert.Equal("Pending", result.Status);
            Assert.Equal("AI Club", result.ClubName);
        }

        [Fact]
        public async Task Duplicate_Pending_Request_Is_Rejected()
        {
            _repo.Setup(r => r.ClubExistsAndIsActiveAsync(1)).ReturnsAsync(true);
            _repo.Setup(r => r.FindExistingMembershipAsync("student-1", 1))
                .ReturnsAsync(new CCMS.Domain.Entities.ClubMembership { Status = MembershipStatus.Pending });

            var service = BuildService();
            await Assert.ThrowsAsync<ValidationFailedException>(
                () => service.RequestJoinClubAsync("student-1", new JoinClubRequestDto { ClubId = 1 }));
        }

        [Fact]
        public async Task Existing_Member_Cannot_Request_Again()
        {
            _repo.Setup(r => r.ClubExistsAndIsActiveAsync(1)).ReturnsAsync(true);
            _repo.Setup(r => r.FindExistingMembershipAsync("student-1", 1))
                .ReturnsAsync(new CCMS.Domain.Entities.ClubMembership { Status = MembershipStatus.Active });

            var service = BuildService();
            await Assert.ThrowsAsync<ValidationFailedException>(
                () => service.RequestJoinClubAsync("student-1", new JoinClubRequestDto { ClubId = 1 }));
        }

        [Fact]
        public async Task Invalid_Club_Is_Rejected()
        {
            _repo.Setup(r => r.ClubExistsAndIsActiveAsync(999)).ReturnsAsync(false);

            var service = BuildService();
            await Assert.ThrowsAsync<NotFoundException>(
                () => service.RequestJoinClubAsync("student-1", new JoinClubRequestDto { ClubId = 999 }));
        }

        [Fact]
        public async Task Saved_Membership_Has_Pending_Status()
        {
            CCMS.Domain.Entities.ClubMembership? captured = null;
            _repo.Setup(r => r.ClubExistsAndIsActiveAsync(1)).ReturnsAsync(true);
            _repo.Setup(r => r.FindExistingMembershipAsync("student-1", 1)).ReturnsAsync((CCMS.Domain.Entities.ClubMembership?)null);
            _repo.Setup(r => r.AddAsync(It.IsAny<CCMS.Domain.Entities.ClubMembership>()))
                .Callback<CCMS.Domain.Entities.ClubMembership>(m => captured = m)
                .ReturnsAsync((CCMS.Domain.Entities.ClubMembership m) => m);
            _repo.Setup(r => r.GetClubNameAsync(1)).ReturnsAsync("AI Club");

            var service = BuildService();
            await service.RequestJoinClubAsync("student-1", new JoinClubRequestDto { ClubId = 1 });

            Assert.NotNull(captured);
            Assert.Equal(MembershipStatus.Pending, captured!.Status);
        }
    }
}
