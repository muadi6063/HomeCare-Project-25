namespace HomecareApp.Models;
public class AvailableDay
{
    public int AvailableDayId { get; set; }
    public int HealthcarePersonnelId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public User HealthcarePersonnel { get; set; }
    public List<Appointment>? Appointments { get; set; } 
}