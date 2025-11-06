using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.DTOs;

public class RegisterDTO
{
    [Required]
    public string Username { get; set; } = String.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = String.Empty;

    [Required]
    public string Password { get; set; } = String.Empty;
}