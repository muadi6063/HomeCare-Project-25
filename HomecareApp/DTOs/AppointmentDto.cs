using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.DTOs;

public class AppointmentDto
{
    public int AppointmentId { get; set; }

    [Required(ErrorMessage = "Client is required")]
    public string ClientId { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }

    [Required(ErrorMessage = "Available day is required")]
    public int AvailableDayId { get; set; }
    public DateTime? AvailableDayDate { get; set; }
    public string? HealthcarePersonnelName { get; set; }

    [Required(ErrorMessage = "Start time is required")]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "End time is required")]
    public TimeSpan EndTime { get; set; }

    [Required(ErrorMessage = "Task description is required")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "Task description must be between 5 and 500 characters")]
    public string TaskDescription { get; set; } = string.Empty;
}

public class EndTimeAfterStartTime : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        return value is DateTime date && date.Date > DateTime.Today;
    }
}