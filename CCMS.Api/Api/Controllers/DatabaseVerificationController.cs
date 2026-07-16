using CCMS.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CCMS.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class DatabaseVerificationController : ControllerBase
{
    private readonly MysqlRepository _repository;

    public DatabaseVerificationController(MysqlRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _repository.GetUsersAsync();
        return Ok(users);
    }

    [HttpGet("clubs")]
    public async Task<IActionResult> GetClubs()
    {
        var clubs = await _repository.GetClubsAsync();
        return Ok(clubs);
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _repository.GetEventsAsync();
        return Ok(events);
    }

    [HttpGet("announcements")]
    public async Task<IActionResult> GetAnnouncements()
    {
        var announcements = await _repository.GetAnnouncementsAsync();
        return Ok(announcements);
    }

    [HttpGet("memberships")]
    public async Task<IActionResult> GetMemberships()
    {
        var memberships = await _repository.GetMembershipsAsync();
        return Ok(memberships);
    }

    [HttpGet("join-requests")]
    public async Task<IActionResult> GetJoinRequests()
    {
        var joinRequests = await _repository.GetJoinRequestsAsync();
        return Ok(joinRequests);
    }

    [HttpGet("club-executives")]
    public async Task<IActionResult> GetClubExecutives()
    {
        var clubExecutives = await _repository.GetClubExecutivesAsync();
        return Ok(clubExecutives);
    }
}
