using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;
public class AvailableDay
{
    public int AvailableDayId { get; set; }
    
    [Required(ErrorMessage = "Helsepersonell er påkrevd.")]
    public int HealthcarePersonnelId { get; set; }
    
    [Required(ErrorMessage = "Dato er påkrevd.")]
    [DataType(DataType.Date)]
    public DateTime Date { get; set; }
    
    [Required(ErrorMessage = "Starttid er påkrevd.")]
    [DataType(DataType.Time)]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "Sluttid er påkrevd.")]
    [DataType(DataType.Time)]
    public TimeSpan EndTime { get; set; }
    
    public User? HealthcarePersonnel { get; set; }
    public List<Appointment>? Appointments { get; set; } 
}