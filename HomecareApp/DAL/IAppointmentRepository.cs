using HomeCareApp.Models;

namespace HomeCareApp.DAL;
    public interface IAppointmentRepository
    {
        Task<IEnumerable<Appointment>?> GetAll();
        Task<Appointment?> GetAppointmentById(int id);
        Task Create(Appointment appointment);
        Task Update(Appointment appointment);
        Task<bool> Delete(int id);
    }