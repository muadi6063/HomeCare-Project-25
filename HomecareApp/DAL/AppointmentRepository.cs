using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

namespace HomecareApp.DAL;
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly HomeCareDbContext _db;

        public AppointmentRepository(HomeCareDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Appointment>> GetAll()
        {
            var appointments = await _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.AvailableDay)
                    .ThenInclude(d => d!.HealthcarePersonnel)
                .OrderBy(a => a.AvailableDay!.Date)
                .ToListAsync();
            
            return appointments.OrderBy(a => a.StartTime);    
        }

        public async Task<Appointment?> GetAppointmentById(int id)
        {
            return await _db.Appointments
                .Include(a => a.Client)
                .Include(a => a.AvailableDay)
                    .ThenInclude(d => d!.HealthcarePersonnel)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);
        }

        public async Task Create(Appointment appointment)
        {
            _db.Appointments.Add(appointment);
            await _db.SaveChangesAsync();
        }

        public async Task Update(Appointment appointment)
        {
            _db.Appointments.Update(appointment);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> Delete(int id)
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return false;
            }
            _db.Appointments.Remove(appointment);
            await _db.SaveChangesAsync();
            return true;
        }
    }