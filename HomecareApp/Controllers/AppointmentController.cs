using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims;
using HomeCareApp.Models;
using HomeCareApp.DAL;
using HomeCareApp.DTOs;

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentAPIController : Controller
{
    private readonly ILogger<AppointmentAPIController> _logger;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IAvailableDayRepository _availableDayRepository;
    private bool IsClientAccessingOthers(string ownerId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return User.IsInRole("Client") && currentUserId != ownerId;
    }

    public AppointmentAPIController(
        IAppointmentRepository appointmentRepository,
        ILogger<AppointmentAPIController> logger,
        IAvailableDayRepository availableDayRepository)
    {
        _appointmentRepository = appointmentRepository;
        _logger = logger;
        _availableDayRepository = availableDayRepository;
    }
    
    [HttpGet("appointmentlist")]
    [Authorize(Roles = "Admin,HealthcarePersonnel,Client")]
    public async Task<IActionResult> AppointmentList(){
        var appointments = await _appointmentRepository.GetAll();
        if (appointments == null)
        {
            _logger.LogError("[AppointmentAPI] Appointment list not found while executing _appointmentRepository.GetAll()");
            return NotFound("Appointment list not found");
        }
        if (User.IsInRole("Client"))
        {
        appointments = appointments
            .Where(a => !IsClientAccessingOthers(a.ClientId))
            .ToList();
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
    [Authorize(Roles = "Admin,HealthcarePersonnel,Client")]
    public async Task<IActionResult> Create([FromBody] AppointmentDto dto)
    {

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (dto == null)
            return BadRequest("Appointment cannot be null");

        var availableDay = await _availableDayRepository.GetAvailableDayById(dto.AvailableDayId);
        if (availableDay == null)
        {
            _logger.LogWarning("[AppointmentAPIController] AvailableDay {AvailableDayId} not found", dto.AvailableDayId);
            return BadRequest("The selected available day does not exist");
        }

        if (User.IsInRole("Client"))
        {


            dto.ClientId = currentUserId!;
        }

        var newAppointment = new Appointment
        {
            ClientId = dto.ClientId!,
            AvailableDayId = dto.AvailableDayId,
            StartTime = availableDay.StartTime,
            EndTime = availableDay.EndTime,
            TaskDescription = dto.TaskDescription
        };

        bool success = await _appointmentRepository.Create(newAppointment);
        if (success)
        {
            var created = await _appointmentRepository.GetAppointmentById(newAppointment.AppointmentId);
            var responseDto = new AppointmentDto
            {
                AppointmentId = created!.AppointmentId,
                ClientId = created.ClientId,
                ClientName = created.Client?.Name,
                ClientEmail = created.Client?.Email,
                AvailableDayId = created.AvailableDayId,
                AvailableDayDate = created.AvailableDay?.Date,
                HealthcarePersonnelName = created.AvailableDay?.HealthcarePersonnel?.Name,
                StartTime = created.StartTime,
                EndTime = created.EndTime,
                TaskDescription = created.TaskDescription
            };
            
            return CreatedAtAction(nameof(GetAppointment), new { id = newAppointment.AppointmentId }, responseDto);
        }

        _logger.LogWarning("[AppointmentAPIController] appointment creation failed {@appointment}", newAppointment);
        return StatusCode(500, "Internal server error");

    }
    
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,HealthcarePersonnel,Client")]
    public async Task<IActionResult> GetAppointment(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
        {
            _logger.LogError("[AppointmentAPIController] Appointment not found for the AppointmentId {AppointmentId:0000}", id);
            return NotFound("Appointment not found for the AppointmentId");
        }
        if (IsClientAccessingOthers(appointment.ClientId))
        {
            _logger.LogWarning("Client {UserId} attempted to access appointment {AppointmentId} not theirs",
                User.FindFirstValue(ClaimTypes.NameIdentifier), id);
            return Forbid();
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
    [Authorize(Roles = "Admin,HealthcarePersonnel,Client")]
    public async Task<IActionResult> Update(int id, [FromBody] AppointmentDto dto)
    {
        if (dto == null)
            return BadRequest("Appointment data cannot be null");

        var existing = await _appointmentRepository.GetAppointmentById(id);
        if (existing == null)
            return NotFound("Appointment not found");
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.IsInRole("Client"))
        {
            if (IsClientAccessingOthers(existing.ClientId))
            {
                _logger.LogWarning("Client {UserId} attempted to update appointment {AppointmentId} not belonging to them",
                    currentUserId, id);
                return Forbid();
            }

            dto.ClientId = currentUserId!;
        }

        existing.ClientId = dto.ClientId!;
        existing.AvailableDayId = dto.AvailableDayId;
        existing.StartTime = dto.StartTime;
        existing.EndTime = dto.EndTime;
        existing.TaskDescription = dto.TaskDescription;

        bool updateSuccessful = await _appointmentRepository.Update(existing);
        if (updateSuccessful)
        {
            var updated = await _appointmentRepository.GetAppointmentById(id);
            var responseDto = new AppointmentDto
            {
                AppointmentId = updated!.AppointmentId,
                ClientId = updated.ClientId,
                ClientName = updated.Client?.Name,
                ClientEmail = updated.Client?.Email,
                AvailableDayId = updated.AvailableDayId,
                AvailableDayDate = updated.AvailableDay?.Date,
                HealthcarePersonnelName = updated.AvailableDay?.HealthcarePersonnel?.Name,
                StartTime = updated.StartTime,
                EndTime = updated.EndTime,
                TaskDescription = updated.TaskDescription
            };
            
            return Ok(responseDto);;
        }
        _logger.LogError("[AppointmentAPIController] Appointment update failed {@appointment}", existing);
        return StatusCode(500, "Internal server error during update");

    }
    
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin,HealthcarePersonnel,Client")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
            return NotFound("Appointment not found");
        if (IsClientAccessingOthers(appointment.ClientId))
        {
            _logger.LogWarning("Client {UserId} attempted to delete appointment {AppointmentId} not theirs",
                User.FindFirstValue(ClaimTypes.NameIdentifier), id);
            return Forbid();
        }
        bool success = await _appointmentRepository.Delete(id);
        if (!success)
        {
            _logger.LogError("[AppointmentAPIController] Appointment deletion failed for AppointmentId {AppointmentId:0000}", id);
            return BadRequest("Appointment deletion failed");
        }
        return NoContent();
    }
}