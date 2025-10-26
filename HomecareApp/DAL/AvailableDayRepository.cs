using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

namespace HomecareApp.DAL;
    public class AvailableDayRepository : IAvailableDayRepository
    {
        private readonly HomeCareDbContext _db;

        public AvailableDayRepository(HomeCareDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AvailableDay>> GetAll()
        {
            return await _db.AvailableDays
                .Include(ad => ad.HealthcarePersonnel)
                .Include(ad => ad.Appointments)
                .OrderBy(ad => ad.HealthcarePersonnel!.Name)
                .ThenBy(ad => ad.Date)
                .ToListAsync();
        }

        public async Task<AvailableDay?> GetAvailableDayById(int id)
        {
            return await _db.AvailableDays
                .Include(ad => ad.HealthcarePersonnel)
                .FirstOrDefaultAsync(ad => ad.AvailableDayId == id);
        }

        public async Task Create(AvailableDay availableDay)
        {
            _db.AvailableDays.Add(availableDay);
            await _db.SaveChangesAsync();
        }

        public async Task Update(AvailableDay availableDay)
        {
            _db.AvailableDays.Update(availableDay);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> Delete(int id)
        {
            var availableDay = await _db.AvailableDays.FindAsync(id);
            if (availableDay == null)
            {
                return false;
            }
            _db.AvailableDays.Remove(availableDay);
            await _db.SaveChangesAsync();
            return true;
        }
    }