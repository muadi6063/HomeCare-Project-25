using HomecareApp.Models;

namespace HomecareApp.DAL;
    public interface IAvailableDayRepository
    {
        Task<IEnumerable<AvailableDay>> GetAll();
        Task<AvailableDay?> GetAvailableDayById(int id);
        Task Create(AvailableDay availableDay);
        Task Update(AvailableDay availableDay);
        Task<bool> Delete(int id);
    }