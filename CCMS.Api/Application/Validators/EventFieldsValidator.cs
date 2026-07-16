using CCMS.Application.Exceptions;

namespace CCMS.Application.Validators
{
    public class EventFieldsInput
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime EventDateUtc { get; set; } // date + time combined
        public string Location { get; set; } = string.Empty;
        public int ClubId { get; set; }
        public string RequestingUserId { get; set; } = string.Empty;
    }

    /// <summary>
    /// Read-only data the Task 1 owner populates from the DB before calling this
    /// validator (RCE-13 only needs these two — RCE-14 field rules need nothing
    /// beyond the input itself).
    /// </summary>
    public class EventFieldsContext
    {
        public bool DuplicateEventNameExistsForClub { get; set; } // RCE-13 only
        public bool RequestingUserOwnsThisClub { get; set; }      // RCE-13 only
    }

    public interface IEventFieldsValidator
    {
        /// <summary>RCE-14: field-level validation shared by both create and edit flows.</summary>
        void ValidateFields(EventFieldsInput input);

        /// <summary>RCE-13: field validation PLUS the create-specific rules (ownership, duplicate name).</summary>
        void ValidateForCreate(EventFieldsInput input, EventFieldsContext context);
    }

    public class EventFieldsValidator : IEventFieldsValidator
    {
        private const int TitleMinLength = 3;
        private const int TitleMaxLength = 150;
        private const int DescriptionMaxLength = 3000;
        private const int LocationMaxLength = 250;

        public void ValidateFields(EventFieldsInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new ValidationFailedException("Event title is required.");
            }

            var trimmedTitle = input.Title.Trim();
            if (trimmedTitle.Length < TitleMinLength || trimmedTitle.Length > TitleMaxLength)
            {
                throw new ValidationFailedException(
                    $"Event title must be between {TitleMinLength} and {TitleMaxLength} characters.");
            }

            if (string.IsNullOrWhiteSpace(input.Description))
            {
                throw new ValidationFailedException("Event description is required.");
            }

            if (input.Description.Trim().Length > DescriptionMaxLength)
            {
                throw new ValidationFailedException($"Event description cannot exceed {DescriptionMaxLength} characters.");
            }

            if (string.IsNullOrWhiteSpace(input.Location))
            {
                throw new ValidationFailedException("Event location is required.");
            }

            if (input.Location.Trim().Length > LocationMaxLength)
            {
                throw new ValidationFailedException($"Event location cannot exceed {LocationMaxLength} characters.");
            }

            if (input.EventDateUtc == default)
            {
                throw new ValidationFailedException("A valid event date and time is required.");
            }

            // "Future dates" / "past dates rejected" — events must be scheduled ahead of now.
            if (input.EventDateUtc <= DateTime.UtcNow)
            {
                throw new ValidationFailedException("Event date and time must be in the future.");
            }
        }

        public void ValidateForCreate(EventFieldsInput input, EventFieldsContext context)
        {
            ValidateFields(input);

            if (string.IsNullOrWhiteSpace(input.RequestingUserId))
            {
                throw new ValidationFailedException("You must be logged in to create an event.");
            }

            if (input.ClubId <= 0)
            {
                throw new ValidationFailedException("A valid club must be specified for this event.");
            }

            // Ownership: only an Executive/Admin of THIS club may create events for it
            // (role check itself is C-01's job; this is the per-resource ownership check).
            if (!context.RequestingUserOwnsThisClub)
            {
                throw new ValidationFailedException("You don't have permission to create events for this club.");
            }

            if (context.DuplicateEventNameExistsForClub)
            {
                throw new ValidationFailedException("An event with this name already exists for this club.");
            }
        }
    }
}
