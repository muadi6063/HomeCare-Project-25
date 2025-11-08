using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;  
using HomeCareApp.Models;
using HomeCareApp.DAL;
using HomeCareApp.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
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

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, HealthcarePersonnel")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            _logger.LogError("[UserAPIController] User not found for id {UserId}", id);
            return NotFound("User not found");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var dto = new UserDto
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email ?? "Unknown Email",
            Role = roles.FirstOrDefault() ?? "Unknown Role"
        };

        return Ok(dto);
    }

    [HttpPost("create")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] UserDto dto)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("[UserAPIController] Invalid model state");
            return BadRequest(ModelState);
        }

        if (!await _roleManager.RoleExistsAsync(dto.Role))
        {
            _logger.LogWarning("[UserAPIController] Invalid role: {Role}", dto.Role);
            return BadRequest(new { message = "Role '" + dto.Role + "' does not exist" });
        }

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            Name = dto.Name
        };

        // Generate temporary password when admin creates user
        var tempPassword = GenerateTemporaryPassword();
        
        var result = await _userManager.CreateAsync(user, tempPassword);

        if (result.Succeeded)
        {
            var roleResult = await _userManager.AddToRoleAsync(user, dto.Role);
            
            if (roleResult.Succeeded)
            {
                _logger.LogInformation("[UserAPIController] User created: {Username} with role {Role} by admin {Admin}", 
                    user.UserName, dto.Role, User.Identity?.Name);
                
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
                {
                    message = "User created successfully",
                    userId = user.Id,
                    username = user.UserName,
                    email = user.Email,
                    role = dto.Role,
                    temporaryPassword = tempPassword,
                    note = "In production, this would be emailed to the user. User should change password on first login."
                });
            }
            else
            {
                // Delete user if role assignment fails
                await _userManager.DeleteAsync(user);
                _logger.LogWarning("[UserAPIController] Role assignment failed for {Name}", user.Name);
                return BadRequest(roleResult.Errors);
            }
        }

        _logger.LogWarning("[UserAPIController] User creation failed for {Name}", dto.Name);
        return BadRequest(result.Errors);
    }

    [HttpPut("update/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UserDto dto)
    {
        if (dto == null)
            return BadRequest("User data cannot be null");

        var existing = await _userManager.FindByIdAsync(id);
        if (existing == null)
            return NotFound("User not found");

        existing.Name = dto.Name;
        existing.Email = dto.Email;
        existing.UserName = dto.Email; 

        var result = await _userManager.UpdateAsync(existing);
        if (!result.Succeeded)
        {
            _logger.LogWarning("[UserAPIController] Failed to update user {@errors}", result.Errors);
            return StatusCode(500, "Internal server error");
        }

        if (!string.IsNullOrEmpty(dto.Role))
        {
            if (!await _roleManager.RoleExistsAsync(dto.Role))
            {
                _logger.LogWarning("[UserAPIController] Invalid role: {Role}", dto.Role);
                return BadRequest(new { message = "Role '" + dto.Role + "' does not exist" });
            }
            var currentRoles = await _userManager.GetRolesAsync(existing);
            await _userManager.RemoveFromRolesAsync(existing, currentRoles);
            await _userManager.AddToRoleAsync(existing, dto.Role);
        }

        return Ok(dto);
    }

    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            _logger.LogError("[UserAPIController] Failed to delete user with id {UserId}", id);
            return NotFound($"User {id} not found");
        }

        // ← CHANGED: Use UserManager for delete
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            _logger.LogError("[UserAPIController] Delete failed {@errors}", result.Errors);
            return StatusCode(500, "Delete failed");
        }

        return NoContent();
    }
    
    // Ikke helt klart, må finne løsning for å gi midlertidig passord når admin lager en ny bruker
    private string GenerateTemporaryPassword(int length = 12)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        var data = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(data);
        var passwordChars = data.Select(b => chars[b % chars.Length]).ToArray();
        return new string(passwordChars);
    }
}