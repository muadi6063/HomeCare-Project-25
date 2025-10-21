using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;
public class AvailableDay
{
    public int AvailableDayId { get; set; }
    
    [Required(ErrorMessage = "Healthcare personnel is required")]
    public int HealthcarePersonnelId { get; set; } 

    [Required(ErrorMessage = "Date is required")]
    [DataType(DataType.Date)]
    public DateTime Date { get; set; } 

    [Required(ErrorMessage = "Start time is required")]
    [DataType(DataType.Time)]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "End time is required")]
    [DataType(DataType.Time)]
    public TimeSpan EndTime { get; set; }

    public User? HealthcarePersonnel { get; set; } = default!;
    public List<Appointment>? Appointments { get; set; } 
}