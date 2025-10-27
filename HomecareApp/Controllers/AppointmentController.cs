using Microsoft.AspNetCore.Mvc;
using HomecareApp.Models;
using HomecareApp.DAL;

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