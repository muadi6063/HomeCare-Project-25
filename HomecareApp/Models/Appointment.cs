using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.Models;

public class Appointment
{
    public int AppointmentId { get; set; }

    [Required(ErrorMessage = "Client is required")]
    public string ClientId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Available day is required")]
    public int AvailableDayId { get; set; }

    [Required(ErrorMessage = "Start time is required")]
    [DataType(DataType.Time)]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "End time is required")]
    [DataType(DataType.Time)]
    public TimeSpan EndTime { get; set; }

    [Required(ErrorMessage = "Task description is required")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "Task description must be between 5 and 500 characters")]
    public string TaskDescription { get; set; } = string.Empty;

    public User? Client { get; set; }
    public AvailableDay? AvailableDay { get; set; }
}