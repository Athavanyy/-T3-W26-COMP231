using CCMS.Application.Exceptions;

namespace CCMS.Application.Validators
{
    public class DeleteEventInput
    {
        public int EventId { get; set; }
        public string RequestingUserId { get; set; } = string.Empty;
        // "Deletion confirmation" per spec — the frontend should show a confirm
        // dialog and only send true once the user has explicitly confirmed.
        public bool ConfirmationProvided { get; set; }
    }

    public class DeleteEventContext
    {
        public bool EventExists { get; set; }
        public bool RequestingUserOwnsThisClub { get; set; }
        public int ExistingRegistrationCount { get; set; }
    }

    public interface IDeleteEventValidator
    {
        void Validate(DeleteEventInput input, DeleteEventContext context);
    }

    /// <summary>
    /// RCE-17: Delete Event — validation only. Task 1 (the actual delete/save) is
    /// out of scope here.
    /// </summary>
    public class DeleteEventValidator : IDeleteEventValidator
    {
        public void Validate(DeleteEventInput input, DeleteEventContext context)
        {
            if (string.IsNullOrWhiteSpace(input.RequestingUserId))
            {
                throw new ValidationFailedException("You must be logged in to delete an event.");
            }

            if (input.EventId <= 0)
            {
                throw new ValidationFailedException("A valid event must be specified.");
            }

            if (!context.EventExists)
            {
                throw new NotFoundException("This event doesn't exist or has already been deleted.");
            }

            // Ownership/authorization: only the owning club's Executive/Admin can delete
            // (role itself is C-01's job; this is the per-resource ownership check).
            if (!context.RequestingUserOwnsThisClub)
            {
                throw new ValidationFailedException("You don't have permission to delete this event.");
            }

            if (!input.ConfirmationProvided)
            {
                throw new ValidationFailedException("Please confirm that you want to delete this event.");
            }

            // Assumption flagged for the team: the spec lists "existing registrations
            // (if applicable)" as something to validate, but doesn't say whether that
            // means "block deletion" or "just check/warn." I chose to block deletion
            // outright rather than silently orphan registered students — if your team
            // wants a "cancel + notify" flow instead, this check needs to change.
            if (context.ExistingRegistrationCount > 0)
            {
                throw new ValidationFailedException(
                    "This event has existing registrations and cannot be deleted. Cancel the event instead to notify registered students.");
            }
        }
    }
}
