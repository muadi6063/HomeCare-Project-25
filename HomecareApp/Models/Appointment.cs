namespace HomecareApp.Models;

public class Appointment
{
    public int AppointmentId { get; set; }
    public int ClientId { get; set; }
    public int AvailableDayId { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string TaskDescription { get; set; }

    public User Client { get; set; }
    public AvailableDay AvailableDay { get; set; }
}

// Fiks warnings??