using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.Models;

public class AvailableDay
{
    public int AvailableDayId { get; set; }

    [Required(ErrorMessage = "Healthcare personell is required")]
    public int HealthcarePersonnelId { get; set; }

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

    public User HealthcarePersonnel { get; set; } = default!;
    public List<Appointment>? Appointments { get; set; }
}


// This is a custom validation attribute to make sure date is always in future (One day ahead)
public class FutureDateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        return value is DateTime date && date.Date > DateTime.Today;
    }
}