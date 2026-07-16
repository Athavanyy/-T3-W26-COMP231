namespace CCMS.Application.DTOs
{
    public class JoinClubRequestDto
    {
        public int ClubId { get; set; }
    }

    /// <summary>
    /// Shape matches what JoinConfirmation.jsx needs to render its success/pending state.
    /// </summary>
    public class JoinClubResultDto
    {
        public int RequestId { get; set; }
        public string ClubName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAtUtc { get; set; }
    }
}
