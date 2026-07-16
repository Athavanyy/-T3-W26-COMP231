using CCMS.Application.DTOs;
using CCMS.Application.Exceptions;
using CCMS.Domain.Entities;
using CCMS.Domain.Enums;
using CCMS.Infrastructure.Repositories;

namespace CCMS.Application.Services
{
    public interface IClubMembershipService
    {
        Task<JoinClubResultDto> RequestJoinClubAsync(string userId, JoinClubRequestDto request);
    }

    /// <summary>
    /// RS-07: Join Club — business logic and validation only.
    /// Controller stays thin; all rules live here so they're independently unit-testable.
    /// </summary>
    public class ClubMembershipService : IClubMembershipService
    {
        private readonly IClubMembershipRepository _repository;

        public ClubMembershipService(IClubMembershipRepository repository)
        {
            _repository = repository;
        }

        public async Task<JoinClubResultDto> RequestJoinClubAsync(string userId, JoinClubRequestDto request)
        {
            if (request.ClubId <= 0)
            {
                throw new ValidationFailedException("A valid club must be selected.");
            }

            // 1. Club must exist and be active — cheapest DB check, fail fast.
            var clubIsActive = await _repository.ClubExistsAndIsActiveAsync(request.ClubId);
            if (!clubIsActive)
            {
                throw new NotFoundException("This club doesn't exist or isn't currently accepting members.");
            }

            // 2 & 3. Existing membership / pending request check, combined into one lookup.
            var existing = await _repository.FindExistingMembershipAsync(userId, request.ClubId);
            if (existing is not null)
            {
                var message = existing.Status switch
                {
                    MembershipStatus.Active => "You're already a member of this club.",
                    MembershipStatus.Pending => "You already have a pending request for this club.",
                    // A previously rejected request is allowed to re-apply — spec doesn't
                    // say otherwise, and blocking re-application indefinitely would be
                    // an unstated business rule. Flag this with your team if that's wrong.
                    MembershipStatus.Rejected => null,
                    _ => null
                };

                if (message is not null)
                {
                    throw new ValidationFailedException(message);
                }
            }

            var membership = new ClubMembership
            {
                UserId = userId,
                ClubId = request.ClubId,
                Status = MembershipStatus.Pending,
                RequestedAtUtc = DateTime.UtcNow
            };

            var saved = await _repository.AddAsync(membership);
            var clubName = await _repository.GetClubNameAsync(request.ClubId);

            return new JoinClubResultDto
            {
                RequestId = saved.Id,
                ClubName = clubName,
                Status = saved.Status.ToString(),
                RequestedAtUtc = saved.RequestedAtUtc
            };
        }
    }
}
