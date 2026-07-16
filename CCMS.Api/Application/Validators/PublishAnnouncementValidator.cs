using CCMS.Application.Exceptions;

namespace CCMS.Application.Validators
{
    public class PublishAnnouncementInput
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int ClubId { get; set; }
        public string RequestingUserId { get; set; } = string.Empty;
    }

    public class PublishAnnouncementContext
    {
        public bool RequestingUserOwnsThisClub { get; set; }
        // "Duplicate publishing" — this specific draft has already been published
        // once; re-submitting the same publish action shouldn't create a second copy.
        public bool AlreadyPublished { get; set; }
    }

    public interface IPublishAnnouncementValidator
    {
        void Validate(PublishAnnouncementInput input, PublishAnnouncementContext context);
    }

    /// <summary>
    /// RCE-20: Publish Announcement — validation only.
    /// </summary>
    public class PublishAnnouncementValidator : IPublishAnnouncementValidator
    {
        private const int TitleMaxLength = 150;
        private const int ContentMaxLength = 5000;

        public void Validate(PublishAnnouncementInput input, PublishAnnouncementContext context)
        {
            if (string.IsNullOrWhiteSpace(input.RequestingUserId))
            {
                throw new ValidationFailedException("You must be logged in to publish an announcement.");
            }

            if (input.ClubId <= 0)
            {
                throw new ValidationFailedException("A valid club must be specified.");
            }

            if (!context.RequestingUserOwnsThisClub)
            {
                throw new ValidationFailedException("You don't have permission to publish announcements for this club.");
            }

            // "Draft completeness" / "required fields" — title and content must both
            // be present; an incomplete draft cannot be published.
            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new ValidationFailedException("Announcement title is required before publishing.");
            }

            if (input.Title.Trim().Length > TitleMaxLength)
            {
                throw new ValidationFailedException($"Announcement title cannot exceed {TitleMaxLength} characters.");
            }

            if (string.IsNullOrWhiteSpace(input.Content))
            {
                throw new ValidationFailedException("Announcement content is required before publishing.");
            }

            if (input.Content.Trim().Length > ContentMaxLength)
            {
                throw new ValidationFailedException($"Announcement content cannot exceed {ContentMaxLength} characters.");
            }

            if (context.AlreadyPublished)
            {
                throw new ValidationFailedException("This announcement has already been published.");
            }
        }
    }
}
