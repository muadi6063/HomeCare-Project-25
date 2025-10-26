using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;
using HomecareApp.ViewModels;
using HomecareApp.DAL;

namespace HomecareApp.Controllers;

public class AvailableDayController : Controller
{
    private readonly IAvailableDayRepository _availableDayRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AvailableDayController> _logger;

    public AvailableDayController(IAvailableDayRepository availableDayRepository, IUserRepository userRepository, ILogger<AvailableDayController> logger)
    {
        _availableDayRepository = availableDayRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<IActionResult> Table()
    {
        try
        {
            var availableDays = await _availableDayRepository.GetAll();
            if (availableDays == null)
            {
                _logger.LogError("[AvailableDayController] Available day list not found while executing _availableDayRepository.GetAll()");
                return NotFound("Available day list not found");
            }
            var groupedData = availableDays.GroupBy(ad => ad.HealthcarePersonnel);    
            var viewModel = new AvailableDaysViewModel(groupedData, "Table");
            return View(viewModel);
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayController] Error loading available days for table, error message: {e}", e.Message);
            var emptyGroupedData = new List<AvailableDay>().GroupBy(ad => ad.HealthcarePersonnel);
            var emptyViewModel = new AvailableDaysViewModel(emptyGroupedData, "Table");
            return View(emptyViewModel);
        }
    }

    public async Task<IActionResult> Create()
    {
        try
        {
            // Get healthcare personnel for dropdown
            ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");
            return View();
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayController] Error loading create form data while executing GetUsersByRole(), error message: {e}", e.Message);
            return View();
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(AvailableDay availableDay)
    {
        try
        {
            ModelState.Remove(nameof(availableDay.HealthcarePersonnel));    
            
            if (ModelState.IsValid)
            {
                await _availableDayRepository.Create(availableDay);  // Use repository
                return RedirectToAction(nameof(Table));
            }
            
            _logger.LogWarning("[AvailableDayController] Available day creation failed {@availableDay}", availableDay);
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("=== VALIDATION ERRORS ===");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine($"Validation Error: {error.ErrorMessage}");
                }
            }
            
            // REPOPULATE ViewBag when validation fails
            ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");
            
            return View(availableDay);
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayController] Error creating available day, error message: {e}", e.Message);
            ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");
            return View(availableDay);
        }
    }

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        try
        {
            var availableDay = await _availableDayRepository.GetAvailableDayById(id);
            if (availableDay == null)
            {
                _logger.LogError("[AvailableDayController] Available day not found for the AvailableDayId {AvailableDayId:0000}", id);
                return NotFound("Available day not found for the AvailableDayId");
            }

            ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");

            return View(availableDay);
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayController] Error loading available day for update, AvailableDayId {AvailableDayId:0000}, error message: {e}", id, e.Message);
            return NotFound();
        }
    }

    [HttpPost]
public async Task<IActionResult> Update(AvailableDay availableDay)
{
    try
    {
        ModelState.Remove(nameof(availableDay.HealthcarePersonnel));
        
        if (ModelState.IsValid)
        {
            await _availableDayRepository.Update(availableDay);
            return RedirectToAction(nameof(Table));
        }
        
        _logger.LogWarning("[AvailableDayController] Available day update failed {@availableDay}", availableDay);
        
        // Repopulate ViewBag on validation failure
        ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");
        return View(availableDay);
    }
    catch (Exception e)
    {
        _logger.LogError("[AvailableDayController] Error updating available day, error message: {e}", e.Message);
        ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");
        return View(availableDay);
    }
}

    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var availableDay = await _availableDayRepository.GetAvailableDayById(id);
            if (availableDay == null)
            {
                _logger.LogError("[AvailableDayController] Available day not found for the AvailableDayId {AvailableDayId:0000}", id);
                return NotFound();
            }
            return View(availableDay);
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayController] Error loading available day for deletion, AvailableDayId {AvailableDayId:0000}, error message: {e}", id, e.Message);
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        try
        {
            var result = await _availableDayRepository.Delete(id);
            if (!result)
            {
                _logger.LogError("[AvailableDayController] Available day deletion failed for AvailableDayId {AvailableDayId:0000}", id);
                return NotFound();
            }
            return RedirectToAction(nameof(Table));
        }
        catch (Exception e)
        {
            _logger.LogError("[AvailableDayController] Error deleting available day, AvailableDayId {AvailableDayId:0000}, error message: {e}", id, e.Message);
            return RedirectToAction(nameof(Table));
        }
    }
}