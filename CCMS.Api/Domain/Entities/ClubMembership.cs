using CCMS.Domain.Enums;

namespace CCMS.Domain.Entities
{
    /// <summary>
    /// Represents both a join request (Pending) and an active membership (Active),
    /// so RS-07 (join), RCE-09 (approve), and RCE-10 (reject) all operate on the
    /// same row rather than duplicating data across separate tables.
    /// If your project already has a membership entity, merge these fields into
    /// it instead of introducing a parallel one.
    /// </summary>
    public class ClubMembership
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int ClubId { get; set; }
        public MembershipStatus Status { get; set; }
        public DateTime RequestedAtUtc { get; set; }
        public DateTime? DecidedAtUtc { get; set; }
    }
}
