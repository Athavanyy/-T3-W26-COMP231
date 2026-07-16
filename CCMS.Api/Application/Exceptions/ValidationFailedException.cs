namespace CCMS.Application.Exceptions
{
    /// <summary>
    /// Thrown for business-rule/validation failures where the Message is safe
    /// to show directly to the user (per "never expose internal exceptions").
    /// The controller catches this specifically and maps it to a 400 response;
    /// anything else (unhandled exceptions) falls through to a generic 500
    /// with no internal detail leaked.
    /// </summary>
    public class ValidationFailedException : Exception
    {
        public ValidationFailedException(string message) : base(message) { }
    }

    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }
}
