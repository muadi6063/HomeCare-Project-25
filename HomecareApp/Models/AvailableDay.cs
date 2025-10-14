using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;
public class AvailableDay
{
    public int AvailableDayId { get; set; }
    
    [Required(ErrorMessage = "Healthcare Personnel is required.")]
    public int HealthcarePersonnelId { get; set; }
    
    [Required(ErrorMessage = "Date is required.")]
    [DataType(DataType.Date)]
    public DateTime Date { get; set; }
    
    [Required(ErrorMessage = "Start Time is required.")]
    [DataType(DataType.Time)]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "End Time is required.")]
    [DataType(DataType.Time)]
    public TimeSpan EndTime { get; set; }
    
    public User? HealthcarePersonnel { get; set; }
    public List<Appointment>? Appointments { get; set; } 
}