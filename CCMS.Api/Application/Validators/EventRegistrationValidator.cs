using CCMS.Application.Exceptions;

namespace CCMS.Application.Validators
{
    public class EventRegistrationValidationInput
    {
        public string UserId { get; set; } = string.Empty;
        public int EventId { get; set; }
    }

    /// <summary>
    /// Minimal read-only data needed to validate a registration attempt.
    /// Whoever implements RS-17 Task 1 (the actual workflow/controller/save logic)
    /// should populate this from their repository and pass it in here — this class
    /// does not touch the database itself, per "Task 2: validation only".
    /// </summary>
    public class EventRegistrationContext
    {
        public bool EventExists { get; set; }
        public bool EventIsCancelled { get; set; }
        public bool RegistrationIsClosed { get; set; }
        public DateTime? RegistrationDeadlineUtc { get; set; }
        public int Capacity { get; set; }
        public int CurrentRegistrationCount { get; set; }
        public bool UserAlreadyRegistered { get; set; }
        public bool UserIsEligible { get; set; } // e.g. correct role/membership if the event requires it
    }

    public interface IEventRegistrationValidator
    {
        void Validate(EventRegistrationValidationInput input, EventRegistrationContext context);
    }

    /// <summary>
    /// RS-17 Task 2: Submit Event Registration — validation layer only.
    /// Task 1 (controller/service/DB save) is explicitly out of scope here.
    /// </summary>
    public class EventRegistrationValidator : IEventRegistrationValidator
    {
        public void Validate(EventRegistrationValidationInput input, EventRegistrationContext context)
        {
            if (string.IsNullOrWhiteSpace(input.UserId))
            {
                throw new ValidationFailedException("You must be logged in to register for an event.");
            }

            if (input.EventId <= 0)
            {
                throw new ValidationFailedException("A valid event must be selected.");
            }

            if (!context.EventExists)
            {
                throw new NotFoundException("This event doesn't exist.");
            }

            if (context.EventIsCancelled)
            {
                throw new ValidationFailedException("This event has been cancelled and is no longer accepting registrations.");
            }

            if (context.RegistrationIsClosed)
            {
                throw new ValidationFailedException("Registration for this event is closed.");
            }

            if (context.RegistrationDeadlineUtc.HasValue && DateTime.UtcNow > context.RegistrationDeadlineUtc.Value)
            {
                throw new ValidationFailedException("The registration deadline for this event has passed.");
            }

            if (context.Capacity > 0 && context.CurrentRegistrationCount >= context.Capacity)
            {
                throw new ValidationFailedException("This event has reached its maximum capacity.");
            }

            if (context.UserAlreadyRegistered)
            {
                throw new ValidationFailedException("You're already registered for this event.");
            }

            if (!context.UserIsEligible)
            {
                throw new ValidationFailedException("You're not eligible to register for this event.");
            }
        }
    }
}
