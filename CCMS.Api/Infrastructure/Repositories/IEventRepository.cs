using CCMS.Domain.Entities;

namespace CCMS.Infrastructure.Repositories
{
    /// <summary>
    /// If the project already has an IEventRepository, add GetByIdAsync to it
    /// instead of introducing a duplicate interface.
    /// </summary>
    public interface IEventRepository
    {
        Task<Event?> GetByIdAsync(int eventId);
    }
}
