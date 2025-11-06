using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.DAL;
using HomeCareApp.DTOs;
using Microsoft.AspNetCore.Identity;


namespace HomeCareApp.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AvailableDayAPIController : ControllerBase
{
    
    private readonly IAvailableDayRepository _availableDayRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AvailableDayAPIController> _logger;
    private readonly UserManager<User> _userManager;

    public AvailableDayAPIController(IAvailableDayRepository availableDayRepository, IUserRepository userRepository, ILogger<AvailableDayAPIController> logger, UserManager<User> userManager)
    {
        _availableDayRepository = availableDayRepository;
        _userRepository = userRepository;
        _logger = logger;
        _userManager = userManager;
    }

    [HttpGet("availableDaysList")]
    public async Task<IActionResult> AvailableDaysList()
    {
        var availableDays = await _availableDayRepository.GetAll();
        if (availableDays == null)
        {
            _logger.LogError("[AvailableDayAPIController] Available day list not found while executing _availableDayRepository.GetAll()");
            return NotFound("Available day list not found");
        }

        var groupedData = new List<Object>();
        
        foreach (var personnelGroup in availableDays 
            .Where(ad => ad.HealthcarePersonnel != null)
            .GroupBy(ad => ad.HealthcarePersonnel))
        {
            var personnel = personnelGroup.Key!;
            var roles = await _userManager.GetRolesAsync(personnel);
            
            groupedData.Add(new
            {
                HealthcarePersonnel = new UserDto
                {
                    UserId = personnel.Id,
                    Name = personnel.Name,
                    Email = personnel.Email ?? "Unkown Email",
                    Role = roles.FirstOrDefault() ?? "Unknown Role" 
                },
                AvailableDays = personnelGroup.Select(ad => new AvailableDayDto
                {
                    AvailableDayId = ad.AvailableDayId,
                    HealthcarePersonnelId = ad.HealthcarePersonnelId,
                    HealthcarePersonnelName = ad.HealthcarePersonnel?.Name,
                    HealthcarePersonnelEmail = ad.HealthcarePersonnel?.Email,
                    Date = ad.Date,
                    StartTime = ad.StartTime,
                    EndTime = ad.EndTime
                }).ToList()
            });
        }

        return Ok(groupedData);
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] AvailableDayDto availableDayDto)
    {

        if (availableDayDto == null)
        {
            return BadRequest("Item cannot be null");
        }

        var newAvailableDay = new AvailableDay
        {
            HealthcarePersonnelId = availableDayDto.HealthcarePersonnelId,
            Date = availableDayDto.Date,
            StartTime = availableDayDto.StartTime,
            EndTime = availableDayDto.EndTime,
            Appointments = new List<Appointment>()
        };
        bool returnOk = await _availableDayRepository.Create(newAvailableDay);
        if (returnOk)
        {
            return CreatedAtAction(nameof(GetAvailableDay), new { id = newAvailableDay.AvailableDayId }, newAvailableDay);
        }

        _logger.LogWarning("[AvailableDayAPIController] availableday creation failed {@availableDay}", newAvailableDay);
        return StatusCode(500, "Internal server error");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAvailableDay(int id)
    {
        var availableDay = await _availableDayRepository.GetAvailableDayById(id);
        if (availableDay == null)
        {
            _logger.LogError("[AvailableDayAPIController] AvailableDay not found for the Id {AvailableDayId:0000}", id);
            return NotFound("AvailableDay not found for the Id");
        }
        return Ok(availableDay);
    }

    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AvailableDayDto availableDayDto)
    {
        if (availableDayDto == null)
        {
            return BadRequest("available day data cannot be null");
        }

        var existingAvailableDay = await _availableDayRepository.GetAvailableDayById(id);

        if (existingAvailableDay == null)
        {
            return NotFound("Available day not found");
        }

        existingAvailableDay.HealthcarePersonnelId = availableDayDto.HealthcarePersonnelId;
        existingAvailableDay.Date = availableDayDto.Date;
        existingAvailableDay.StartTime = availableDayDto.StartTime;
        existingAvailableDay.EndTime = availableDayDto.EndTime;
        
        bool updateSuccessful = await _availableDayRepository.Update(existingAvailableDay);
        if (updateSuccessful)
        {
            return Ok(existingAvailableDay);
        }

        _logger.LogWarning("[AvailableDayAPIController] available day update failed {@availableDay}", existingAvailableDay);
        return StatusCode(500, "Internal server error");
    }
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        bool returnOk = await _availableDayRepository.Delete(id);
        if (!returnOk)
        {
            _logger.LogError("[AvailableDayAPIController] AvailableDay deletion failed for the Id {AvailableDayId:0000}", id);
            return BadRequest("Item deletion failed");
        }
        return NoContent();
    }
}