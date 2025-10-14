using System.ComponentModel.DataAnnotations;

namespace HomecareApp.Models;

public class User
{
    public int UserId { get; set; }
    
    [Required(ErrorMessage = "Navn er påkrevd.")]
    [StringLength(100, ErrorMessage = "Navnet kan ikke overstige 100 tegn.")]
    public string Name { get; set; }
    
    [Required(ErrorMessage = "E-post er påkrevd.")]
    [EmailAddress(ErrorMessage = "Ugyldig e-postformat.")]
    public string Email { get; set; }
    
    [Required(ErrorMessage = "Rolle er påkrevd.")]
    public string Role { get; set; } 
}