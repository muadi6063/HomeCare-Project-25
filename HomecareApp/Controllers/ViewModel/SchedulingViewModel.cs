using HomecareApp.Models;

namespace HomecareApp.ViewModels
{
    public class SchedulingViewModel
    {
        public List<AvailableDay> AvailableDays { get; set; } = new();
        public List<Appointment> Appointments { get; set; } = new();
    }
}
