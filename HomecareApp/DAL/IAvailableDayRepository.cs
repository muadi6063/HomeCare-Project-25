using HomeCareApp.Models;

namespace HomeCareApp.DAL;
    public interface IAvailableDayRepository
    {
        Task<IEnumerable<AvailableDay>> GetAll();
        Task<IEnumerable<AvailableDay>> GetUnbookedAvailableDays();
        Task<AvailableDay?> GetAvailableDayById(int id);
        Task<bool> Create(AvailableDay availableDay);
        Task<bool> Update(AvailableDay availableDay);
        Task<bool> Delete(int id);
    }