using HomeCareApp.Models;

namespace HomeCareApp.DAL;
    public interface IAppointmentRepository
    {
        Task<IEnumerable<Appointment>?> GetAll();
        Task<Appointment?> GetAppointmentById(int id);
        Task<bool> Create(Appointment appointment);
        Task<bool> Update(Appointment appointment);
        Task<bool> Delete(int id);
    }