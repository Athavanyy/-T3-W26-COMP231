using CCMS.Application.DTOs;
using CCMS.Application.Exceptions;
using CCMS.Infrastructure.Repositories;

namespace CCMS.Application.Services
{
    public interface IEventDetailsService
    {
        Task<EventDetailsDto> GetEventDetailsAsync(int eventId);
    }

    /// <summary>
    /// RS-14: Check Event Date and Location.
    /// </summary>
    public class EventDetailsService : IEventDetailsService
    {
        private const string LocationPlaceholder = "Location to be announced";
        private readonly IEventRepository _repository;

        public EventDetailsService(IEventRepository repository)
        {
            _repository = repository;
        }

        public async Task<EventDetailsDto> GetEventDetailsAsync(int eventId)
        {
            if (eventId <= 0)
            {
                throw new ValidationFailedException("A valid event must be specified.");
            }

            var ev = await _repository.GetByIdAsync(eventId);
            if (ev is null)
            {
                throw new NotFoundException("This event doesn't exist.");
            }

            // Unpublished events shouldn't have their details exposed to students
            // browsing/selecting events (RS-14 validation: "unpublished event").
            if (string.Equals(ev.Status, "Draft", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(ev.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationFailedException("This event is not currently available.");
            }

            return new EventDetailsDto
            {
                EventId = ev.Id,
                Title = ev.Title,
                EventDateUtc = ev.EventDateUtc,
                Location = string.IsNullOrWhiteSpace(ev.Location) ? LocationPlaceholder : ev.Location,
                Status = ev.Status
            };
        }
    }
}
