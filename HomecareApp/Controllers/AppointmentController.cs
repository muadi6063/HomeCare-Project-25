using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.DAL;
using HomeCareApp.DTOs; 

[ApiController]
[Route("api/[controller]")]
public class AppointmentAPIController : Controller
{
    private readonly ILogger<AppointmentAPIController> _logger;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAvailableDayRepository _availableDayRepository;
    
    public AppointmentAPIController(
        IAppointmentRepository appointmentRepository, 
        IUserRepository userRepository,
        IAvailableDayRepository availableDayRepository,
        ILogger<AppointmentAPIController> logger)
    {
        _appointmentRepository = appointmentRepository;
        _userRepository = userRepository;
        _availableDayRepository = availableDayRepository;
        _logger = logger;
    }
    [HttpGet("appointmentlist")]
    public async Task<IActionResult> AppointmentList(){
        var appointments = await _appointmentRepository.GetAll();
        if (appointments == null){
            _logger.LogError("[AppointmentAPI] Appointment list not found while executing _appointmentRepository.GetAll()");
            return NotFound("Appointment list not found");
        }

        var dtos = appointments.Select(a =>  new AppointmentDto{
            AppointmentId = a.AppointmentId,
            ClientId = a.ClientId,
            ClientName = a.Client?.Name,
            ClientEmail = a.Client?.Email,
            AvailableDayId = a.AvailableDayId,
            AvailableDayDate = a.AvailableDay?.Date,
            HealthcarePersonnelName = a.AvailableDay?.HealthcarePersonnel?.Name,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            TaskDescription = a.TaskDescription
        });

        return  Ok(dtos);
    }
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] AppointmentDto dto){
        if (dto == null)
        return BadRequest("Appointment cannot be null");

        var newAppointment = new Appointment
        {
            ClientId = dto.ClientId,
            AvailableDayId = dto.AvailableDayId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            TaskDescription = dto.TaskDescription
        };
        
        bool success = await _appointmentRepository.Create(newAppointment);
        if (success)
        {
            return CreatedAtAction(nameof(GetAppointment), new { id = newAppointment.AppointmentId }, newAppointment);
        }

        _logger.LogWarning("[AppointmentAPIController] appointment creation failed {@appointment}", newAppointment);
        return StatusCode(500, "Internal server error");

      

    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAppointment(int id)
    {
          var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
        {
            _logger.LogError("[AppointmentAPIController] Appointment not found for the AppointmentId {AppointmentId:0000}", id);
            return NotFound("Appointment not found for the AppointmentId");
        }

        var dto = new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            ClientId = appointment.ClientId,
            ClientName = appointment.Client?.Name,
            ClientEmail = appointment.Client?.Email,
            AvailableDayId = appointment.AvailableDayId,
            AvailableDayDate = appointment.AvailableDay?.Date,
            HealthcarePersonnelName = appointment.AvailableDay?.HealthcarePersonnel?.Name,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            TaskDescription = appointment.TaskDescription
        };

        return Ok(dto);
    }
    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AppointmentDto dto)
    {
         if (dto == null)
            return BadRequest("Appointment data cannot be null");

        var existing = await _appointmentRepository.GetAppointmentById(id);
        if (existing == null)
            return NotFound("Appointment not found");

        existing.ClientId = dto.ClientId;
        existing.AvailableDayId = dto.AvailableDayId;
        existing.StartTime = dto.StartTime;
        existing.EndTime = dto.EndTime;
        existing.TaskDescription = dto.TaskDescription;

        bool updateSuccessful = await _appointmentRepository.Update(existing);
        if (updateSuccessful)
        {
            return Ok(existing);
        }
        _logger.LogError("[AppointmentAPIController] Appointment update failed {@appointment}", existing);
        return StatusCode(500, "Internal server error during update");

    }
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        bool success = await _appointmentRepository.Delete(id);
        if (!success)
        {
            _logger.LogError("[AppointmentAPIController] Appointment deletion failed for AppointmentId {AppointmentId:0000}", id);
            return BadRequest("Appointment deletion failed");
        }
        return NoContent();
    }
}