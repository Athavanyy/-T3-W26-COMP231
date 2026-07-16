namespace CCMS.Domain.Entities
{
    /// <summary>
    /// Minimal shape needed for RS-14. If an Event entity already exists elsewhere
    /// in the project, merge these fields into it rather than duplicating the model.
    /// </summary>
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime EventDateUtc { get; set; }
        public string? Location { get; set; } // nullable: "no location set yet" is valid
        public string Status { get; set; } = "Draft"; // e.g. Draft, Published, Cancelled
    }
}
