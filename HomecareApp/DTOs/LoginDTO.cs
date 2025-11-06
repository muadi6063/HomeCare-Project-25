using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.DTOs;

public class LoginDTO
{
    [Required]
    public string Username { get; set; } = String.Empty;

    [Required]
    public string Password { get; set; } = String.Empty;
}