using CCMS.Application.Exceptions;
using CCMS.Application.Validators;
using CCMS.Domain.Enums;
using Xunit;

namespace CCMS.Tests.JoinRequestDecisions
{
    public class JoinRequestDecisionValidatorTests
    {
        private readonly JoinRequestDecisionValidator _validator = new();

        private static JoinRequestDecisionInput Input() => new() { RequestId = 1, DecidingUserId = "exec-1" };

        private static JoinRequestDecisionContext PendingOwnedContext() => new()
        {
            RequestExists = true,
            CurrentStatus = MembershipStatus.Pending,
            DecidingUserOwnsThisClub = true,
            UserAlreadyHasActiveMembershipElsewhere = false
        };

        // --- RCE-09: Approve ---

        [Fact]
        public void Approve_Pending_Request_Succeeds()
        {
            var exception = Record.Exception(() => _validator.ValidateApprove(Input(), PendingOwnedContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Approve_Already_Active_Membership_Is_Rejected()
        {
            var ctx = PendingOwnedContext();
            ctx.UserAlreadyHasActiveMembershipElsewhere = true;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateApprove(Input(), ctx));
        }

        [Fact]
        public void Approve_Non_Pending_Request_Is_Rejected()
        {
            var ctx = PendingOwnedContext();
            ctx.CurrentStatus = MembershipStatus.Active;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateApprove(Input(), ctx));
        }

        [Fact]
        public void Approve_By_NonOwning_Executive_Is_Rejected()
        {
            var ctx = PendingOwnedContext();
            ctx.DecidingUserOwnsThisClub = false;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateApprove(Input(), ctx));
        }

        // --- RCE-10: Reject ---

        [Fact]
        public void Reject_Pending_Request_Succeeds()
        {
            var exception = Record.Exception(() => _validator.ValidateReject(Input(), PendingOwnedContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Reject_Already_Rejected_Request_Is_Rejected_As_Duplicate_Processing()
        {
            var ctx = PendingOwnedContext();
            ctx.CurrentStatus = MembershipStatus.Rejected;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateReject(Input(), ctx));
        }

        [Fact]
        public void Reject_Nonexistent_Request_Is_Rejected()
        {
            var ctx = PendingOwnedContext();
            ctx.RequestExists = false;
            Assert.Throws<NotFoundException>(() => _validator.ValidateReject(Input(), ctx));
        }

        [Fact]
        public void Reject_By_Unauthenticated_User_Is_Rejected()
        {
            var input = new JoinRequestDecisionInput { RequestId = 1, DecidingUserId = "" };
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateReject(input, PendingOwnedContext()));
        }
    }
}
