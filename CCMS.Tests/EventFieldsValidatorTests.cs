using CCMS.Application.Exceptions;
using CCMS.Application.Validators;
using Xunit;

namespace CCMS.Tests.EventFields
{
    public class EventFieldsValidatorTests
    {
        private readonly EventFieldsValidator _validator = new();

        private static EventFieldsInput ValidInput() => new()
        {
            Title = "AI Club Kickoff",
            Description = "Come meet the team and learn what we're building this semester.",
            EventDateUtc = DateTime.UtcNow.AddDays(7),
            Location = "Room 204",
            ClubId = 1,
            RequestingUserId = "exec-1"
        };

        private static EventFieldsContext ValidContext() => new()
        {
            DuplicateEventNameExistsForClub = false,
            RequestingUserOwnsThisClub = true
        };

        // --- RCE-14: field-level rules (shared) ---

        [Fact]
        public void Valid_Fields_Do_Not_Throw()
        {
            var exception = Record.Exception(() => _validator.ValidateFields(ValidInput()));
            Assert.Null(exception);
        }

        [Fact]
        public void Blank_Title_Is_Rejected()
        {
            var input = ValidInput();
            input.Title = "   ";
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        [Fact]
        public void Title_Too_Short_Is_Rejected()
        {
            var input = ValidInput();
            input.Title = "AB";
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        [Fact]
        public void Title_Too_Long_Is_Rejected()
        {
            var input = ValidInput();
            input.Title = new string('A', 151);
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        [Fact]
        public void Blank_Description_Is_Rejected()
        {
            var input = ValidInput();
            input.Description = "";
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        [Fact]
        public void Blank_Location_Is_Rejected()
        {
            var input = ValidInput();
            input.Location = "   ";
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        [Fact]
        public void Past_Date_Is_Rejected()
        {
            var input = ValidInput();
            input.EventDateUtc = DateTime.UtcNow.AddDays(-1);
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        [Fact]
        public void Default_Date_Is_Rejected()
        {
            var input = ValidInput();
            input.EventDateUtc = default;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateFields(input));
        }

        // --- RCE-13: create-specific rules ---

        [Fact]
        public void Valid_Create_Does_Not_Throw()
        {
            var exception = Record.Exception(() => _validator.ValidateForCreate(ValidInput(), ValidContext()));
            Assert.Null(exception);
        }

        [Fact]
        public void Duplicate_Event_Name_Is_Rejected()
        {
            var ctx = ValidContext();
            ctx.DuplicateEventNameExistsForClub = true;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateForCreate(ValidInput(), ctx));
        }

        [Fact]
        public void NonOwning_User_Cannot_Create_Event()
        {
            var ctx = ValidContext();
            ctx.RequestingUserOwnsThisClub = false;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateForCreate(ValidInput(), ctx));
        }

        [Fact]
        public void Missing_Club_Is_Rejected()
        {
            var input = ValidInput();
            input.ClubId = 0;
            Assert.Throws<ValidationFailedException>(() => _validator.ValidateForCreate(input, ValidContext()));
        }
    }
}
