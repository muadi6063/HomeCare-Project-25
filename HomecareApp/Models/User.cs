using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;

public class User
{
    public int UserId { get; set; }
    
<<<<<<< HEAD
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    public string Name { get; set; }
    
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; }
    
    [Required(ErrorMessage = "Role is required.")]
    public string Role { get; set; } 
=======
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
    public string? Name { get; set; }
    
    [Required(ErrorMessage = "Email required")]
    [EmailAddress(ErrorMessage = "Wrong email address.")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", 
    ErrorMessage = "Please enter a valid email address.")]
    public string? Email { get; set; }
    
    [Required(ErrorMessage = "Role is required")]
    public string? Role { get; set; } 
>>>>>>> 9fde06371473e6f829da7a69cd8a59caf8aad335
}