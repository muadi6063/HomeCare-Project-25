using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.DAL;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : Controller
{
    private readonly ILogger<AppointmentController> _logger;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAvailableDayRepository _availableDayRepository;
    
    public AppointmentController(
        IAppointmentRepository appointmentRepository, 
        IUserRepository userRepository,
        IAvailableDayRepository availableDayRepository,
        ILogger<AppointmentController> logger)
    {
        _appointmentRepository = appointmentRepository;
        _userRepository = userRepository;
        _availableDayRepository = availableDayRepository;
        _logger = logger;
    }
    [HttpGet("appointmenlist")]
    public async Task<IActionResult> AppointmentList(){
        var appointments = await _appointmentRepository.GetAll();
        if (appointments == null){
            _logger.LogError("[AppointmentAPI] Appointment list not found while executing _appointmentRepository.GetAll()");
            return NotFound("Appointment list not found")
        }

        var dtos = appointments.Select(a =>  new AppointmentDto{
            AppointmentId = a.AppointmentId,
            ClientId = a.ClientId,
            ClientName = a.Client?.Name,
            ClientEmail = a.Client?.Email,
            AvailableDayId = a.AvailableDayId,
            AvailableDayDate = a.AvailableDay?.Date,
            HealthcarePersonneLName = a.AvailableDay?.HealthcarePersonnel?.Name,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            TaskDescription = a.TaskDescription
        });

        return  Ok(dtos)
    }
    [HttpPost("create")]
    public async  Task<IActionResult> Create([FromBody] AppointmentDto dto){
        if (dto == null)
        return BadRequest("Appointment cannot be null")

        var newAppointment = new Appointment
        {
            ClientId  = dto.ClientId,
            AvailableDayId = dto.AvailableDayId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            TaskDescription = dto.TaskDescription
        };
        var success = await _appointmentRepository.Create(newAppointment);
        if (success)
        return CreatedAtAction(nameof(GetAppointment), new { id = newAppointment.AppointmentId }, newAppointment);

        _logger.LogWarning("[AppointmentAPIController] Appointment  creation failed  {@appointment}", newAppointment);
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
            HealthcarePersonneLName = appointment.AvailableDay?.HealthcarePersonnel?.Name,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            TaskDescription = appointment.TaskDescription
        };

        return Ok(dto);
    }
    [HttpPut("update/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Appointment dto)
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

        var success = await _appointmentRepository.Update(existing);
        if (success)
            return Ok(existing);

        _logger.LogWarning("[AppointmentAPIController] Appointment update failed {@appointment}", existing);
        return StatusCode(500, "Internal server error");
    }
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var success = await _appointmentRepository.Delete(id);
        if (!success)
        {
            _logger.LogError("[AppointmentAPIController] Appointment deletion failed for AppointmentId {AppointmentId:0000}", id);
            return BadRequest("Appointment deletion failed");
        }
        return NoContent();
    }
}
public class AppointmentController : Controller
{
    private readonly ILogger<AppointmentController> _logger;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAvailableDayRepository _availableDayRepository;
    
    public AppointmentController(
        IAppointmentRepository appointmentRepository, 
        IUserRepository userRepository,
        IAvailableDayRepository availableDayRepository,
        ILogger<AppointmentController> logger)
    {
        _appointmentRepository = appointmentRepository;
        _userRepository = userRepository;
        _availableDayRepository = availableDayRepository;
        _logger = logger;
    }
    public async Task<IActionResult> Table()
    {
        _logger.LogInformation("Loading appointments table at {Time}", DateTime.Now);

        try
        {
            var appointments = await _appointmentRepository.GetAll();
            if (appointments == null)
            {
                _logger.LogError("[AppointmentController] Appointment list not found while executing _appointmentRepository.GetAll()");
                return NotFound("Appointment list not found");
            }
            _logger.LogInformation("{Count} appointments for table", appointments.Count());
            return View(appointments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointments for table display");
            return View(new List<Appointment>());
        }
    }
    
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        try
        {
            ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
            ViewBag.AvailableDays = await _availableDayRepository.GetUnbookedAvailableDays();
            return View();
        }
        catch (Exception ex)
        {
            _logger.LogError("[AppointmentController] Error loading create form data while executing GetUsersByRole() or GetAll(), error message: {e}", ex.Message);
            return View();
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(Appointment appointment)
    {
        try
        {
            // Auto-populate times from AvailableDay
            if (appointment.AvailableDayId > 0)
            {
                var availableDay = await _availableDayRepository.GetAvailableDayById(appointment.AvailableDayId);
                if (availableDay != null)
                {
                    appointment.StartTime = availableDay.StartTime;
                    appointment.EndTime = availableDay.EndTime;
                }
            }

            if (ModelState.IsValid)
            {
                await _appointmentRepository.Create(appointment);
                _logger.LogInformation("New appointment created at {Time}", DateTime.Now);
                return RedirectToAction(nameof(Table));
            }

            _logger.LogWarning("[AppointmentController] Appointment creation failed {@appointment}", appointment);

            // Repopulate ViewBag on validation failure
            ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
            ViewBag.AvailableDays = await _availableDayRepository.GetAll();
            return View(appointment);
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentController] Error creating appointment, error message: {e}", e.Message);
            ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
            ViewBag.AvailableDays = await _availableDayRepository.GetAll();
            return View(appointment);
        }
    }

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        try
        {
            var appointment = await _appointmentRepository.GetAppointmentById(id);
            if (appointment == null)
            {
                _logger.LogError("[AppointmentController] Appointment not found for the AppointmentId {AppointmentId:0000}", id);
                return NotFound("Appointment not found for the AppointmentId");
            }

            ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
            ViewBag.AvailableDays = await _availableDayRepository.GetAll();
            return View(appointment);
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentController] Error loading appointment for update, AppointmentId {AppointmentId:0000}, error message: {e}", id, e.Message);
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<IActionResult> Update(Appointment appointment)
    {
        try
        {
            if (ModelState.IsValid)
            {
                await _appointmentRepository.Update(appointment);
                return RedirectToAction(nameof(Table));
            }

            _logger.LogWarning("[AppointmentController] Appointment update failed {@appointment}", appointment);

            ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
            ViewBag.AvailableDays = await _availableDayRepository.GetAll();
            return View(appointment);
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentController] Error updating appointment, error message: {e}", e.Message);
            ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
            ViewBag.AvailableDays = await _availableDayRepository.GetAll();
            return View(appointment);
        }
    }
    
    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var appointment = await _appointmentRepository.GetAppointmentById(id);
            if (appointment == null)
            {
                _logger.LogError("[AppointmentController] Appointment not found for the AppointmentId {AppointmentId:0000}", id);
                return NotFound();
            }
            return View(appointment);
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentController] Error loading appointment for deletion, AppointmentId {AppointmentId:0000}, error message: {e}", id, e.Message);
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        try
        {
            var result = await _appointmentRepository.Delete(id);
            if (!result)
            {
                _logger.LogError("[AppointmentController] Appointment deletion failed for AppointmentId {AppointmentId:0000}", id);
                return NotFound();
            }
            return RedirectToAction(nameof(Table));
        }
        catch (Exception e)
        {
            _logger.LogError("[AppointmentController] Error deleting appointment, AppointmentId {AppointmentId:0000}, error message: {e}", id, e.Message);
            return RedirectToAction(nameof(Table));
        }
    }
}