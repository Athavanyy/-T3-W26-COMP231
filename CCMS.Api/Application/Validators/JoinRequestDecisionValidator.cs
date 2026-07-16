using CCMS.Application.Exceptions;
using CCMS.Domain.Enums;

namespace CCMS.Application.Validators
{
    public class JoinRequestDecisionInput
    {
        public int RequestId { get; set; }
        public string DecidingUserId { get; set; } = string.Empty; // the Executive/Admin making the call
    }

    /// <summary>
    /// Read-only data the Task 1 owner should populate from the DB before calling
    /// this validator. No DB access happens in this class — validation only.
    /// </summary>
    public class JoinRequestDecisionContext
    {
        public bool RequestExists { get; set; }
        public MembershipStatus CurrentStatus { get; set; }
        // Ownership: is the deciding user an Executive/Admin of the CLUB this
        // request belongs to (not just any club)? Cross-club approval is a
        // forbidden action even for a legitimate Executive elsewhere.
        public bool DecidingUserOwnsThisClub { get; set; }
        // RCE-09 specific: does the requesting student already hold an Active
        // membership in this club via some other record (data integrity edge case)?
        public bool UserAlreadyHasActiveMembershipElsewhere { get; set; }
    }

    public interface IJoinRequestDecisionValidator
    {
        void ValidateApprove(JoinRequestDecisionInput input, JoinRequestDecisionContext context);
        void ValidateReject(JoinRequestDecisionInput input, JoinRequestDecisionContext context);
    }

    /// <summary>
    /// RCE-09 (Approve) / RCE-10 (Reject) — validation layer only.
    /// Task 1 (controller/service that actually flips the status and saves) is
    /// explicitly out of scope; this class only decides whether the transition
    /// is allowed and throws a user-safe message if not.
    /// </summary>
    public class JoinRequestDecisionValidator : IJoinRequestDecisionValidator
    {
        public void ValidateApprove(JoinRequestDecisionInput input, JoinRequestDecisionContext context)
        {
            ValidateCommon(input, context);

            // RCE-09: "duplicate memberships prevented" — approving a request for
            // someone who's already active (via a data anomaly) must not create
            // a second active membership.
            if (context.UserAlreadyHasActiveMembershipElsewhere)
            {
                throw new ValidationFailedException("This student already has an active membership in this club.");
            }
        }

        public void ValidateReject(JoinRequestDecisionInput input, JoinRequestDecisionContext context)
        {
            ValidateCommon(input, context);
        }

        private static void ValidateCommon(JoinRequestDecisionInput input, JoinRequestDecisionContext context)
        {
            if (string.IsNullOrWhiteSpace(input.DecidingUserId))
            {
                throw new ValidationFailedException("You must be logged in to perform this action.");
            }

            if (input.RequestId <= 0)
            {
                throw new ValidationFailedException("A valid join request must be specified.");
            }

            if (!context.RequestExists)
            {
                throw new NotFoundException("This join request doesn't exist.");
            }

            // Authorization / ownership: only an Executive/Admin of THIS specific
            // club may decide on it — role check (Executive/Admin) happens at the
            // [Authorize] level in C-01; this is the additional per-resource
            // ownership check that role alone can't express.
            if (!context.DecidingUserOwnsThisClub)
            {
                throw new ValidationFailedException("You don't have permission to manage requests for this club.");
            }

            // Status/transition validation: only a Pending request can be decided.
            // This also doubles as "duplicate processing prevention" for RCE-10 —
            // an already-decided request can't be rejected (or approved) again.
            if (context.CurrentStatus != MembershipStatus.Pending)
            {
                throw new ValidationFailedException(
                    $"This request has already been {context.CurrentStatus.ToString().ToLowerInvariant()} and cannot be changed.");
            }
        }
    }
}
