
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;
using HomecareApp.ViewModels;

namespace HomecareApp.Controllers;
public class AvailableDayController : Controller
{
    private readonly HomeCareDbContext _homeCareDbContext;

    public AvailableDayController(HomeCareDbContext context)
    {
        _homeCareDbContext = context;
    }

    public async Task<IActionResult> Table()
{
    var availableDays = await _homeCareDbContext.AvailableDays
        .Include(ad => ad.HealthcarePersonnel)
        .Include(ad => ad.Appointments)
        .OrderBy(ad => ad.HealthcarePersonnel.Name)
        .ThenBy(ad => ad.Date)
        .ToListAsync();
        
    
    var groupedData = availableDays.GroupBy(ad => ad.HealthcarePersonnel);    
    var viewModel = new AvailableDaysViewModel(groupedData, "Table");
    return View(viewModel);
}

    public async Task<IActionResult> Create()
{
    // Get healthcare personnel for dropdown
    ViewBag.HealthcarePersonnel = await _homeCareDbContext.Users
        .Where(u => u.Role == "HealthcarePersonnel")
        .ToListAsync();
    return View();
}


[HttpPost]
public async Task<IActionResult> Create(AvailableDay availableDay)
{
    Console.WriteLine("=== CREATE POST CALLED ===");
        Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");

    ModelState.Remove(nameof(availableDay.HealthcarePersonnel));    
    
    if (!ModelState.IsValid)
    {
        Console.WriteLine("=== VALIDATION ERRORS ===");
        foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
        {
            Console.WriteLine($"Validation Error: {error.ErrorMessage}");
        }
    }
    
    if (ModelState.IsValid)
    {
        _homeCareDbContext.AvailableDays.Add(availableDay);
        await _homeCareDbContext.SaveChangesAsync();
        return RedirectToAction(nameof(Table));
        
    }
    
    // REPOPULATE ViewBag when validation fails
    ViewBag.HealthcarePersonnel = await _homeCareDbContext.Users
        .Where(u => u.Role == "HealthcarePersonnel")
        .ToListAsync();
    
    return View(availableDay);
}

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        var availableDay = await _homeCareDbContext.AvailableDays.FindAsync(id);
        if (availableDay == null)
        {
            return NotFound();
        }
        return View(availableDay);
    }

    [HttpPost]
    public async Task<IActionResult> Update(AvailableDay availableDay)
    {
        if (ModelState.IsValid)
        {
            _homeCareDbContext.AvailableDays.Update(availableDay);
            await _homeCareDbContext.SaveChangesAsync();
            return RedirectToAction(nameof(Table));
        }
        return View(availableDay);
    }

    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        var availableDay = await _homeCareDbContext.AvailableDays.FindAsync(id);
        if (availableDay == null)
        {
            return NotFound();
        }
        return View(availableDay);
    }

    [HttpPost]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var availableDay = await _homeCareDbContext.AvailableDays.FindAsync(id);
        if (availableDay == null)
        {
            return NotFound();
        }
        _homeCareDbContext.AvailableDays.Remove(availableDay);
        await _homeCareDbContext.SaveChangesAsync();
        return RedirectToAction(nameof(Table));
    }
}