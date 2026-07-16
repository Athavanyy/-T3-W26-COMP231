using CCMS.Application.Exceptions;
using CCMS.Application.Validators;
using CCMS.Domain.Enums;
using Xunit;

namespace CCMS.Tests.RemainingValidators
{
    public class PublishAnnouncementValidatorTests
    {
        private readonly PublishAnnouncementValidator _validator = new();
        private static PublishAnnouncementInput ValidInput() => new()
        {
            Title = "Welcome Back!",
            Content = "Join us for our first meeting of the semester.",
            ClubId = 1,
            RequestingUserId = "exec-1"
        };
        private static PublishAnnouncementContext ValidContext() => new()
        {
            RequestingUserOwnsThisClub = true,
            AlreadyPublished = false
        };

        [Fact]
        public void Complete_Draft_Publishes()
        {
            var exception = Record.Exception(() => _validator.Validate(ValidInput(), ValidContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Missing_Title_Is_Rejected()
        {
            var input = ValidInput();
            input.Title = "";
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(input, ValidContext()));
        }

        [Fact]
        public void Missing_Content_Is_Rejected()
        {
            var input = ValidInput();
            input.Content = "   ";
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(input, ValidContext()));
        }

        [Fact]
        public void Already_Published_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.AlreadyPublished = true;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(ValidInput(), ctx));
        }

        [Fact]
        public void NonOwner_Cannot_Publish()
        {
            var ctx = ValidContext();
            ctx.RequestingUserOwnsThisClub = false;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(ValidInput(), ctx));
        }
    }

    public class DisableAccountValidatorTests
    {
        private readonly DisableAccountValidator _validator = new();
        private static DisableAccountInput ValidInput() => new()
        {
            TargetUserId = "student-1",
            RequestingAdminId = "admin-1",
            ConfirmationProvided = true
        };
        private static DisableAccountContext ValidContext() => new()
        {
            TargetAccountExists = true,
            TargetAccountIsAlreadyDisabled = false,
            TargetIsProtectedAccount = false
        };

        [Fact]
        public void Account_Disabled_Successfully()
        {
            var exception = Record.Exception(() => _validator.Validate(ValidInput(), ValidContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Nonexistent_Account_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.TargetAccountExists = false;
            Assert.Throws<NotFoundException>(() => _validator.Validate(ValidInput(), ctx));
        }

        [Fact]
        public void Already_Disabled_Account_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.TargetAccountIsAlreadyDisabled = true;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(ValidInput(), ctx));
        }

        [Fact]
        public void Admin_Cannot_Disable_Own_Account()
        {
            var input = ValidInput();
            input.TargetUserId = input.RequestingAdminId;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(input, ValidContext()));
        }

        [Fact]
        public void Missing_Confirmation_Is_Rejected()
        {
            var input = ValidInput();
            input.ConfirmationProvided = false;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(input, ValidContext()));
        }

        [Fact]
        public void Protected_Account_Cannot_Be_Disabled()
        {
            var ctx = ValidContext();
            ctx.TargetIsProtectedAccount = true;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(ValidInput(), ctx));
        }
    }

    public class UpdateClubStatusValidatorTests
    {
        private readonly UpdateClubStatusValidator _validator = new();
        private static UpdateClubStatusInput Input(ClubStatus newStatus) => new()
        {
            ClubId = 1,
            RequestingAdminId = "admin-1",
            NewStatus = newStatus
        };
        private static UpdateClubStatusContext Context(ClubStatus current) => new()
        {
            ClubExists = true,
            CurrentStatus = current
        };

        [Fact]
        public void Valid_Transition_Accepted()
        {
            var exception = Record.Exception(() =>
                _validator.Validate(Input(ClubStatus.Active), Context(ClubStatus.PendingApproval)));
            Assert.Null(exception);
        }

        [Fact]
        public void Invalid_Transition_Rejected()
        {
            // Archived is terminal — nothing should be able to leave it.
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(Input(ClubStatus.Active), Context(ClubStatus.Archived)));
        }

        [Fact]
        public void Duplicate_Update_Rejected()
        {
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(Input(ClubStatus.Active), Context(ClubStatus.Active)));
        }

        [Fact]
        public void Nonexistent_Club_Rejected()
        {
            var ctx = Context(ClubStatus.Active);
            ctx.ClubExists = false;
            Assert.Throws<NotFoundException>(() => _validator.Validate(Input(ClubStatus.Inactive), ctx));
        }
    }
}
