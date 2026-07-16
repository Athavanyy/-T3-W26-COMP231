using CCMS.Application.Exceptions;
using CCMS.Application.Validators;
using Xunit;

namespace CCMS.Tests.DeleteEvent
{
    public class DeleteEventValidatorTests
    {
        private readonly DeleteEventValidator _validator = new();

        private static DeleteEventInput ValidInput() => new()
        {
            EventId = 1,
            RequestingUserId = "exec-1",
            ConfirmationProvided = true
        };

        private static DeleteEventContext ValidContext() => new()
        {
            EventExists = true,
            RequestingUserOwnsThisClub = true,
            ExistingRegistrationCount = 0
        };

        [Fact]
        public void Owner_Can_Delete_With_Confirmation()
        {
            var exception = Record.Exception(() => _validator.Validate(ValidInput(), ValidContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Unauthorized_User_Cannot_Delete()
        {
            var ctx = ValidContext();
            ctx.RequestingUserOwnsThisClub = false;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(ValidInput(), ctx));
        }

        [Fact]
        public void Missing_Confirmation_Is_Rejected()
        {
            var input = ValidInput();
            input.ConfirmationProvided = false;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(input, ValidContext()));
        }

        [Fact]
        public void Nonexistent_Event_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.EventExists = false;
            Assert.Throws<NotFoundException>(() => _validator.Validate(ValidInput(), ctx));
        }

        [Fact]
        public void Event_With_Registrations_Cannot_Be_Deleted()
        {
            var ctx = ValidContext();
            ctx.ExistingRegistrationCount = 5;
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(ValidInput(), ctx));
        }

        [Fact]
        public void Unauthenticated_Request_Is_Rejected()
        {
            var input = ValidInput();
            input.RequestingUserId = "";
            Assert.Throws<ValidationFailedException>(() => _validator.Validate(input, ValidContext()));
        }
    }
}
