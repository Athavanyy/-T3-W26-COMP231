using CCMS.Domain.Entities;

namespace CCMS.Infrastructure.Repositories
{
    /// <summary>
    /// Data access contract for RS-07 / RCE-09 / RCE-10. Wire the implementation
    /// to whatever DbContext/ORM the project already uses — this interface only
    /// defines what the service layer needs, not how it's stored.
    /// </summary>
    public interface IClubMembershipRepository
    {
        Task<bool> ClubExistsAndIsActiveAsync(int clubId);
        Task<string> GetClubNameAsync(int clubId);
        Task<ClubMembership?> FindExistingMembershipAsync(string userId, int clubId);
        Task<ClubMembership> AddAsync(ClubMembership membership);
    }
}
