using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.DTOs;

public class AvailableDayDto
{
    public int AvailableDayId { get; set; }

    [Required(ErrorMessage = "Healthcare personell is required")]
    public int HealthcarePersonnelId { get; set; }
    public string? HealthcarePersonnelName { get; set; }
    public string? HealthcarePersonnelEmail { get; set; }

    [Required(ErrorMessage = "Date is required")]
    [DataType(DataType.Date)]
    [FutureDate(ErrorMessage = "Date has to be in future")]
    public DateTime Date { get; set; }

    [Required(ErrorMessage = "Start time is required")]
    [DataType(DataType.Time)]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "End time is required")]
    [DataType(DataType.Time)]
    public TimeSpan EndTime { get; set; }
}

public class FutureDateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        return value is DateTime date && date.Date > DateTime.Today;
    }
}