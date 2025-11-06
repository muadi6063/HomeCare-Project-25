using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;  
using HomeCareApp.Models;
using HomeCareApp.DAL;
using HomeCareApp.DTOs;

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAPIController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UserAPIController> _logger;

    public UserAPIController(
        IUserRepository userRepository, 
        UserManager<User> userManager, 
        ILogger<UserAPIController> logger)
    {
        _userRepository = userRepository;
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet("userlist")]
    public async Task<IActionResult> UsersList()
    {
        var users = await _userRepository.GetAll();
        if (users == null)
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
                Role = roles.FirstOrDefault() ?? "Unkown Role"
            });
        }

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userRepository.GetUserById(id);
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

    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UserDto dto)
    {
        if (dto == null)
            return BadRequest("User data cannot be null");

        var existing = await _userRepository.GetUserById(id);
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
            var currentRoles = await _userManager.GetRolesAsync(existing);
            await _userManager.RemoveFromRolesAsync(existing, currentRoles);
            await _userManager.AddToRoleAsync(existing, dto.Role);
        }

        return Ok(dto);
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(string id) 
    {
        var user = await _userRepository.GetUserById(id);
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
}