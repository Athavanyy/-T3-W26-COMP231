namespace CCMS.Application.DTOs
{
    /// <summary>
    /// Date/Time are returned as ISO 8601 UTC so the frontend can format them
    /// in the user's local timezone/locale — formatting display strings on the
    /// backend would bake in a timezone assumption. Location fallback IS applied
    /// server-side, since "Location to be announced" is a business rule, not a
    /// presentation choice.
    /// </summary>
    public class EventDetailsDto
    {
        public int EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime EventDateUtc { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
