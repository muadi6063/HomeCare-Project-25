using System.ComponentModel.DataAnnotations;


namespace HomecareApp.Models;

public class Appointment
{
    public int AppointmentId { get; set; }
    public int ClientId { get; set; }
    public int AvailableDayId { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    [Required(ErrorMessage = "Task description is required")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "Task description must be between 5 and 500 characters")]
    public string? TaskDescription { get; set; }

    [Required(ErrorMessage = "Client is required")]
    public User? Client { get; set; }

    [Required(ErrorMessage = "Available day is required")]
    public AvailableDay? AvailableDay { get; set; }
}

// Fiks warnings??