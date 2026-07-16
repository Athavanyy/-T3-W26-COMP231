using CCMS.Application.Exceptions;
using CCMS.Domain.Enums;

namespace CCMS.Application.Validators
{
    public class UpdateClubStatusInput
    {
        public int ClubId { get; set; }
        public string RequestingAdminId { get; set; } = string.Empty;
        public ClubStatus NewStatus { get; set; }
    }

    public class UpdateClubStatusContext
    {
        public bool ClubExists { get; set; }
        public ClubStatus CurrentStatus { get; set; }
    }

    public interface IUpdateClubStatusValidator
    {
        void Validate(UpdateClubStatusInput input, UpdateClubStatusContext context);
    }

    /// <summary>
    /// RA-10: Update Club Status — validation only.
    ///
    /// ASSUMPTION FLAGGED FOR THE TEAM: the spec says "valid status transitions" /
    /// "invalid transitions" but doesn't define the actual state machine. I've
    /// picked a reasonable one below — confirm it matches what your team intended,
    /// or adjust AllowedTransitions to the real rules.
    /// </summary>
    public class UpdateClubStatusValidator : IUpdateClubStatusValidator
    {
        private static readonly Dictionary<ClubStatus, ClubStatus[]> AllowedTransitions = new()
        {
            [ClubStatus.PendingApproval] = new[] { ClubStatus.Active, ClubStatus.Archived },
            [ClubStatus.Active] = new[] { ClubStatus.Inactive, ClubStatus.Archived },
            [ClubStatus.Inactive] = new[] { ClubStatus.Active, ClubStatus.Archived },
            [ClubStatus.Archived] = Array.Empty<ClubStatus>() // terminal state, no transitions out
        };

        public void Validate(UpdateClubStatusInput input, UpdateClubStatusContext context)
        {
            if (string.IsNullOrWhiteSpace(input.RequestingAdminId))
            {
                throw new ValidationFailedException("You must be logged in to perform this action.");
            }

            if (input.ClubId <= 0)
            {
                throw new ValidationFailedException("A valid club must be specified.");
            }

            if (!context.ClubExists)
            {
                throw new NotFoundException("This club doesn't exist.");
            }

            // "Duplicate updates" — setting a club to the status it's already in.
            if (context.CurrentStatus == input.NewStatus)
            {
                throw new ValidationFailedException($"This club is already {input.NewStatus}.");
            }

            var allowed = AllowedTransitions.TryGetValue(context.CurrentStatus, out var transitions)
                ? transitions
                : Array.Empty<ClubStatus>();

            if (!allowed.Contains(input.NewStatus))
            {
                throw new ValidationFailedException(
                    $"Cannot change club status from {context.CurrentStatus} to {input.NewStatus}.");
            }
        }
    }
}
