using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;

namespace HomeCareApp.DAL;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly HomeCareDbContext _db;
    private readonly ILogger<AppointmentRepository> _logger;

    public AppointmentRepository(HomeCareDbContext db, ILogger<AppointmentRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<Appointment>?> GetAll()
    {
        try
        {
            var appointments = await _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.AvailableDay)
                    .ThenInclude(d => d!.HealthcarePersonnel)
                .OrderBy(a => a.AvailableDay!.Date)
                .ToListAsync();

            return appointments.OrderBy(a => a.StartTime);
        }

        catch (Exception e)
        {
            _logger.LogError("[AppointmentRepository] appointments ToListAsync() failed when GetAll(), error message: {e}", e.Message);
            return null;
        }
    }

    public async Task<Appointment?> GetAppointmentById(int id)
    {
        try
        {
            return await _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.AvailableDay)
                    .ThenInclude(d => d!.HealthcarePersonnel)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentRepository] appointment FindAsync(id) failed when GetAppointmentById for AppointmentId {AppointmentId:0000}, error message: {e}", id, e.Message);
            return null;
        }
    }

    public async Task Create(Appointment appointment)
    {
        try
        {
            _db.Appointments.Add(appointment);
            await _db.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentRepository] appointment creation failed for appointment {@appointment}, error message: {e}", appointment, e.Message);
            throw;
        }
    }

    public async Task Update(Appointment appointment)
    {
        try
        {
            _db.Appointments.Update(appointment);
            await _db.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentRepository] appointment FindAsync(id) failed when updating the AppointmentId {AppointmentId:0000}, error message: {e}", appointment.AppointmentId, e.Message);
            throw;
        }
    }

    public async Task<bool> Delete(int id)
    {
        try
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment == null)
            {
                _logger.LogError("[AppointmentRepository] appointment not found for the AppointmentId {AppointmentId:0000}", id);
                return false;
            }
            
            _db.Appointments.Remove(appointment);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentRepository] appointment deletion failed for the AppointmentId {AppointmentId:0000}, error message: {e}", id, e.Message);
            return false;
        }
    }
}