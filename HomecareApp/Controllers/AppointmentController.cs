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
        var appointments = await _appointmentRepository.GetAll();
        return View(appointments);
    }
    
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
        ViewBag.AvailableDays = await _availableDayRepository.GetAll();
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(Appointment appointment)
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

        // Repopulate ViewBag on validation failure
        ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
        ViewBag.AvailableDays = await _availableDayRepository.GetAll();
        return View(appointment);
    }

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
        {
            _logger.LogWarning("Appointment with id {id} not found", id);
            return NotFound();
        }

        ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
        ViewBag.AvailableDays = await _availableDayRepository.GetAll();
        return View(appointment);
    }

    [HttpPost]
    public async Task<IActionResult> Update(Appointment appointment)
    {
        if (ModelState.IsValid)
        {
            await _appointmentRepository.Update(appointment);
            return RedirectToAction(nameof(Table));
        }

        ViewBag.Clients = await _userRepository.GetUsersByRole("Client");
        ViewBag.AvailableDays = await _availableDayRepository.GetAll();
        return View(appointment);
    }
    
    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null) return NotFound();
        return View(appointment);
    }

    [HttpPost, ActionName("Delete")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var result = await _appointmentRepository.Delete(id);
        if (!result) return NotFound();
        return RedirectToAction(nameof(Table));
    }
}