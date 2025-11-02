using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.ViewModels;
using HomeCareApp.DAL;
using HomeCareApp.DTOs;

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAPIController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserAPIController> _logger;

    public UserAPIController(IUserRepository userRepository, ILogger<UserAPIController> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }
    [HttpGet("userlist")]
    public async Task<IActionResult> UserList()
    {
        var users = await _userRepository.GetAll();
        if (users == null)
        {
            _logger.LogError("[UserApiController] User list not found while executing _userRepository.GetAll()");
            return NotFound("User list not found");
        }
        var dtos = users.Select(u => new UserDto
        {
            UserId = u.UserId,
            Name = u.Name,
            Email = u.Email,
            Role = u.Role
        });
        return Ok(dtos);
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userRepository.GetUserById(id);
        if (user == null)
        {
            _logger.LogError("[UserAPIController] User not found for id {UserId}", id);
            return NotFound("User not found");
        }

        var dto = new UserDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };

        return Ok(dto);
    }
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] UserDto dto)
    {
        if (dto == null) return BadRequest("User cannot be null");

        var entity = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Role = dto.Role
        };
        bool ok = await _userRepository.Create(entity);
        if (ok)
            return CreatedAtAction(nameof(GetUser), new { id = entity.UserId }, entity);

        _logger.LogWarning("[UserAPIController] User creation failed {@user}", entity);
        return StatusCode(500, "Internal Server error");
    }
    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
    {
        if (dto == null)
            return BadRequest("User data cannot be null");

        var existing = await _userRepository.GetUserById(id);
        if (existing == null)
            return NotFound("User not found");

        existing.Name = dto.Name;
        existing.Email = dto.Email;
        existing.Role = dto.Role;

        bool success = await _userRepository.Update(existing);
        if (!success)
        {
            _logger.LogWarning("[UserAPIController] Failed to update user {@user}", existing);
            return StatusCode(500, "Internal server error");
        }

        return Ok(existing);
    }
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        bool success = await _userRepository.Delete(id);
        if (!success)
        {
            _logger.LogError("[UserAPIController] Failed to delete user with id {UserId}", id);
            return NotFound($"User {id} not found");
        }
        return NoContent();
    }

}