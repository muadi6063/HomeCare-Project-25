using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;

public class User
{
    public int UserId { get; set; }
    
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    public string Name { get; set; }
    
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; }
    
    [Required(ErrorMessage = "Role is required.")]
    public string Role { get; set; } 
}