using CCMS.Application.Exceptions;
using CCMS.Application.Validators;
using Xunit;

namespace CCMS.Tests.EventRegistration
{
    public class EventRegistrationValidatorTests
    {
        private readonly EventRegistrationValidator _validator = new();

        private static EventRegistrationContext ValidContext() => new()
        {
            EventExists = true,
            EventIsCancelled = false,
            RegistrationIsClosed = false,
            RegistrationDeadlineUtc = DateTime.UtcNow.AddDays(1),
            Capacity = 50,
            CurrentRegistrationCount = 10,
            UserAlreadyRegistered = false,
            UserIsEligible = true
        };

        [Fact]
        public void Valid_Registration_Does_Not_Throw()
        {
            var exception = Record.Exception(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ValidContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Duplicate_Registration_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.UserAlreadyRegistered = true;
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Nonexistent_Event_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.EventExists = false;
            Assert.Throws<NotFoundException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Full_Capacity_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.Capacity = 10;
            ctx.CurrentRegistrationCount = 10;
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Past_Deadline_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.RegistrationDeadlineUtc = DateTime.UtcNow.AddDays(-1);
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Cancelled_Event_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.EventIsCancelled = true;
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Closed_Registration_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.RegistrationIsClosed = true;
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Ineligible_User_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.UserIsEligible = false;
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 1 }, ctx));
        }

        [Fact]
        public void Missing_Required_Fields_Rejected()
        {
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "", EventId = 1 }, ValidContext()));
            Assert.Throws<ValidationFailedException>(() =>
                _validator.Validate(new EventRegistrationValidationInput { UserId = "u1", EventId = 0 }, ValidContext()));
        }
    }
}
