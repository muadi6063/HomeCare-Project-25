using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;  
using HomeCareApp.Models;
using HomeCareApp.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;


namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAPIController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UserAPIController> _logger;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UserAPIController(
        UserManager<User> userManager,
        ILogger<UserAPIController> logger,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _logger = logger;
        _roleManager = roleManager;
    }

    [HttpGet("userlist")]
    [Authorize(Roles = "Admin, HealthcarePersonnel")]
    public async Task<IActionResult> UsersList()
    {
        var users = await _userManager.Users.ToListAsync();
        if (users.Count == 0)
        {
            _logger.LogError("[UserApiController] User list not found while executing _userRepository.GetAll()");
            return NotFound("User list not found");
        }

        var dtos = new List<UserDto>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            dtos.Add(new UserDto
            {
                UserId = u.Id,
                Name = u.Name,
                Email = u.Email ?? "Unknown Email",  
                Role = roles.FirstOrDefault() ?? "Unknown Role"
            });
        }

        return Ok(dtos);
    }
}