using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;
public class AvailableDay
{
    public int AvailableDayId { get; set; }
    
<<<<<<< HEAD
    [Required(ErrorMessage = "Healthcare Personnel is required.")]
    public int HealthcarePersonnelId { get; set; }
    
    [Required(ErrorMessage = "Date is required.")]
    [DataType(DataType.Date)]
    public DateTime Date { get; set; }
    
    [Required(ErrorMessage = "Start Time is required.")]
=======
    [Required(ErrorMessage = "Healthcare personell is required")]
    public int? HealthcarePersonnelId { get; set; } 

    [Required(ErrorMessage = "Date is required")]
    [DataType(DataType.Date)]
    public DateTime? Date { get; set; } 

    [Required(ErrorMessage = "Start time is required")]
>>>>>>> 9fde06371473e6f829da7a69cd8a59caf8aad335
    [DataType(DataType.Time)]
    public TimeSpan? StartTime { get; set; }

<<<<<<< HEAD
    [Required(ErrorMessage = "End Time is required.")]
=======
    [Required(ErrorMessage = "End time is required")]
>>>>>>> 9fde06371473e6f829da7a69cd8a59caf8aad335
    [DataType(DataType.Time)]
    public TimeSpan? EndTime { get; set; }
    
    public User? HealthcarePersonnel { get; set; }
    public List<Appointment>? Appointments { get; set; } 
}