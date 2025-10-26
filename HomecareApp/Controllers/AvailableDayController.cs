
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


    public AvailableDayController(IAvailableDayRepository availableDayRepository, IUserRepository userRepository)
    {
        _availableDayRepository = availableDayRepository;
        _userRepository = userRepository;
    }

    public async Task<IActionResult> Table()
    {
        var availableDays = await _availableDayRepository.GetAll();
        var groupedData = availableDays.GroupBy(ad => ad.HealthcarePersonnel);    
        var viewModel = new AvailableDaysViewModel(groupedData, "Table");
        return View(viewModel);
    }

    public async Task<IActionResult> Create()
    {
        // Get healthcare personnel for dropdown
        ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");
        return View();
    }


    [HttpPost]
    public async Task<IActionResult> Create(AvailableDay availableDay)
    {
        ModelState.Remove(nameof(availableDay.HealthcarePersonnel));    
        
        if (ModelState.IsValid)
        {
            await _availableDayRepository.Create(availableDay);  // Use repository
            return RedirectToAction(nameof(Table));
        }
        
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

    
    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        var availableDay = await _availableDayRepository.GetAvailableDayById(id);
        if (availableDay == null)
        {
            return NotFound();
        }

        ViewBag.HealthcarePersonnel = await _userRepository.GetUsersByRole("HealthcarePersonnel");

        return View(availableDay);
    }

    [HttpGet]
public async Task<IActionResult> Delete(int id)
{
    var availableDay = await _availableDayRepository.GetAvailableDayById(id);
    if (availableDay == null)
    {
        return NotFound();
    }
    return View(availableDay);
}

[HttpPost]
public async Task<IActionResult> DeleteConfirmed(int id)
{
    var result = await _availableDayRepository.Delete(id);
    if (!result)
    {
        return NotFound();
    }
    return RedirectToAction(nameof(Table));
}
}