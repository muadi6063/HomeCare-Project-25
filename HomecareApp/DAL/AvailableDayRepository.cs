using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

namespace HomecareApp.DAL;

public class AvailableDayRepository : IAvailableDayRepository
{
    private readonly HomeCareDbContext _db;
    private readonly ILogger<AvailableDayRepository> _logger;

    public AvailableDayRepository(HomeCareDbContext db, ILogger<AvailableDayRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<AvailableDay>> GetAll()
    {
        try
        {
            return await _db.AvailableDays
                .Include(ad => ad.HealthcarePersonnel)
                .Include(ad => ad.Appointments)
                .OrderBy(ad => ad.HealthcarePersonnel!.Name)
                .ThenBy(ad => ad.Date)
                .ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayRepository] availableDays ToListAsync() failed when GetAll(), error message: {e}", e.Message);
            return new List<AvailableDay>();
        }
    }

    public async Task<AvailableDay?> GetAvailableDayById(int id)
    {
        try
        {
            return await _db.AvailableDays
                .Include(ad => ad.HealthcarePersonnel)
                .FirstOrDefaultAsync(ad => ad.AvailableDayId == id);
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayRepository] availableDay FindAsync(id) failed when GetAvailableDayById for AvailableDayId {AvailableDayId:0000}, error message: {e}", id, e.Message);
            return null;
        }
    }

    public async Task Create(AvailableDay availableDay)
    {
        try
        {
            _db.AvailableDays.Add(availableDay);
            await _db.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayRepository] availableDay creation failed for availableDay {@availableDay}, error message: {e}", availableDay, e.Message);
            throw;
        }
    }

    public async Task Update(AvailableDay availableDay)
    {
        try
        {
            _db.AvailableDays.Update(availableDay);
            await _db.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayRepository] availableDay FindAsync(id) failed when updating the AvailableDayId {AvailableDayId:0000}, error message: {e}", availableDay.AvailableDayId, e.Message);
            throw;
        }
    }

    public async Task<bool> Delete(int id)
    {
        try
        {
            var availableDay = await _db.AvailableDays.FindAsync(id);
            if (availableDay == null)
            {
                _logger.LogError("[AvailableDayRepository] availableDay not found for the AvailableDayId {AvailableDayId:0000}", id);
                return false;
            }
            _db.AvailableDays.Remove(availableDay);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayRepository] availableDay deletion failed for the AvailableDayId {AvailableDayId:0000}, error message: {e}", id, e.Message);
            return false;
        }
    }
}