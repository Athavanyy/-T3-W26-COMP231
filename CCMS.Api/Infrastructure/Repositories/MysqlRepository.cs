using System.Data;
using CCMS.Domain.Entities;
using MySql.Data.MySqlClient;

namespace CCMS.Api.Infrastructure.Repositories;

public sealed class MysqlRepository
{
    private readonly MySqlConnectionFactory _connectionFactory;

    public MysqlRepository(MySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Dictionary<string, object?>>> QueryAsync(string sql, params (string Name, object? Value)[] parameters)
    {
        await using var connection = new MySqlConnection(_connectionFactory.CreateConnectionString());
        await connection.OpenAsync();

        await using var command = new MySqlCommand(sql, connection);
        foreach (var (name, value) in parameters)
        {
            command.Parameters.AddWithValue(name, value ?? DBNull.Value);
        }

        await using var reader = await command.ExecuteReaderAsync();
        var results = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>();
            for (var i = 0; i < reader.FieldCount; i++)
            {
                row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            }
            results.Add(row);
        }

        return results;
    }

    public async Task<IReadOnlyList<ClubSummaryDto>> GetClubsAsync()
    {
        const string sql = "SELECT club_id, club_name, category, description, meeting_details, status, created_at FROM clubs ORDER BY club_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new ClubSummaryDto(
            Convert.ToInt32(row["club_id"]),
            row["club_name"]?.ToString() ?? string.Empty,
            row["category"]?.ToString() ?? string.Empty,
            row["description"]?.ToString() ?? string.Empty,
            row["meeting_details"]?.ToString() ?? string.Empty,
            row["status"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["created_at"])
        )).ToList();
    }

    public async Task<IReadOnlyList<UserSummaryDto>> GetUsersAsync()
    {
        const string sql = "SELECT user_id, full_name, email, role, status, created_at FROM users ORDER BY user_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new UserSummaryDto(
            Convert.ToInt32(row["user_id"]),
            row["full_name"]?.ToString() ?? string.Empty,
            row["email"]?.ToString() ?? string.Empty,
            row["role"]?.ToString() ?? string.Empty,
            row["status"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["created_at"])
        )).ToList();
    }

    public async Task<IReadOnlyList<AnnouncementSummaryDto>> GetAnnouncementsAsync()
    {
        const string sql = "SELECT announcement_id, club_id, title, message, status, created_at FROM announcements ORDER BY announcement_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new AnnouncementSummaryDto(
            Convert.ToInt32(row["announcement_id"]),
            Convert.ToInt32(row["club_id"]),
            row["title"]?.ToString() ?? string.Empty,
            row["message"]?.ToString() ?? string.Empty,
            row["status"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["created_at"])
        )).ToList();
    }

    public async Task<IReadOnlyList<EventSummaryDto>> GetEventsAsync()
    {
        const string sql = "SELECT event_id, club_id, title, description, event_date, event_time, location, status, created_at FROM events ORDER BY event_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new EventSummaryDto(
            Convert.ToInt32(row["event_id"]),
            Convert.ToInt32(row["club_id"]),
            row["title"]?.ToString() ?? string.Empty,
            row["description"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["event_date"]),
            row["event_time"] is null || row["event_time"] is DBNull ? null : TimeOnly.FromTimeSpan(TimeSpan.Parse(row["event_time"]!.ToString()!)),
            row["location"]?.ToString() ?? string.Empty,
            row["status"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["created_at"])
        )).ToList();
    }

    public async Task<IReadOnlyList<MembershipSummaryDto>> GetMembershipsAsync()
    {
        const string sql = "SELECT membership_id, user_id, club_id, status, joined_at FROM memberships ORDER BY membership_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new MembershipSummaryDto(
            Convert.ToInt32(row["membership_id"]),
            Convert.ToInt32(row["user_id"]),
            Convert.ToInt32(row["club_id"]),
            row["status"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["joined_at"])
        )).ToList();
    }

    public async Task<IReadOnlyList<JoinRequestSummaryDto>> GetJoinRequestsAsync()
    {
        const string sql = "SELECT request_id, user_id, club_id, request_status, request_date FROM join_requests ORDER BY request_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new JoinRequestSummaryDto(
            Convert.ToInt32(row["request_id"]),
            Convert.ToInt32(row["user_id"]),
            Convert.ToInt32(row["club_id"]),
            row["request_status"]?.ToString() ?? string.Empty,
            Convert.ToDateTime(row["request_date"])
        )).ToList();
    }

    public async Task<IReadOnlyList<ClubExecutiveSummaryDto>> GetClubExecutivesAsync()
    {
        const string sql = "SELECT club_executive_id, user_id, club_id, assigned_at FROM club_executives ORDER BY club_executive_id";
        var rows = await QueryAsync(sql);
        return rows.Select(row => new ClubExecutiveSummaryDto(
            Convert.ToInt32(row["club_executive_id"]),
            Convert.ToInt32(row["user_id"]),
            Convert.ToInt32(row["club_id"]),
            Convert.ToDateTime(row["assigned_at"])
        )).ToList();
    }
}

public sealed record ClubSummaryDto(int ClubId, string ClubName, string Category, string Description, string MeetingDetails, string Status, DateTime CreatedAt);
public sealed record UserSummaryDto(int UserId, string FullName, string Email, string Role, string Status, DateTime CreatedAt);
public sealed record AnnouncementSummaryDto(int AnnouncementId, int ClubId, string Title, string Message, string Status, DateTime CreatedAt);
public sealed record EventSummaryDto(int EventId, int ClubId, string Title, string Description, DateTime EventDate, TimeOnly? EventTime, string Location, string Status, DateTime CreatedAt);
public sealed record MembershipSummaryDto(int MembershipId, int UserId, int ClubId, string Status, DateTime JoinedAt);
public sealed record JoinRequestSummaryDto(int RequestId, int UserId, int ClubId, string Status, DateTime RequestDate);
public sealed record ClubExecutiveSummaryDto(int ClubExecutiveId, int UserId, int ClubId, DateTime AssignedAt);
