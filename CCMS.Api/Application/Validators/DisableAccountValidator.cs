using CCMS.Application.Exceptions;

namespace CCMS.Application.Validators
{
    public class DisableAccountInput
    {
        public string TargetUserId { get; set; } = string.Empty;
        public string RequestingAdminId { get; set; } = string.Empty;
        public bool ConfirmationProvided { get; set; }
    }

    public class DisableAccountContext
    {
        public bool TargetAccountExists { get; set; }
        public bool TargetAccountIsAlreadyDisabled { get; set; }
        // "Protected account restrictions" — e.g. an Administrator shouldn't be able
        // to disable their own account (locks them out) or the last remaining admin.
        public bool TargetIsProtectedAccount { get; set; }
    }

    public interface IDisableAccountValidator
    {
        void Validate(DisableAccountInput input, DisableAccountContext context);
    }

    /// <summary>
    /// RA-06: Disable User Account — validation only.
    /// Authorization (Administrator role) is enforced at [Authorize] via C-01;
    /// this covers the additional business-rule checks the spec calls out.
    /// </summary>
    public class DisableAccountValidator : IDisableAccountValidator
    {
        public void Validate(DisableAccountInput input, DisableAccountContext context)
        {
            if (string.IsNullOrWhiteSpace(input.RequestingAdminId))
            {
                throw new ValidationFailedException("You must be logged in to perform this action.");
            }

            if (string.IsNullOrWhiteSpace(input.TargetUserId))
            {
                throw new ValidationFailedException("A valid account must be specified.");
            }

            if (!context.TargetAccountExists)
            {
                throw new NotFoundException("This account doesn't exist.");
            }

            if (context.TargetAccountIsAlreadyDisabled)
            {
                throw new ValidationFailedException("This account is already disabled.");
            }

            // Assumption flagged for the team: spec says "protected account
            // restrictions (if applicable)" without specifics. I'm treating an
            // admin disabling their OWN account, or the platform's last remaining
            // admin, as protected — confirm this matches your intended rule.
            if (input.TargetUserId == input.RequestingAdminId)
            {
                throw new ValidationFailedException("You cannot disable your own account.");
            }

            if (context.TargetIsProtectedAccount)
            {
                throw new ValidationFailedException("This account is protected and cannot be disabled.");
            }

            if (!input.ConfirmationProvided)
            {
                throw new ValidationFailedException("Please confirm that you want to disable this account.");
            }
        }
    }
}
