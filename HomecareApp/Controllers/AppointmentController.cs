using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

public class AppointmentController : Controller
{
    private readonly ILogger<AppointmentController> _logger;
    private readonly HomeCareDbContext _context;
    
    public AppointmentController(HomeCareDbContext context, ILogger<AppointmentController> logger){
        _logger = logger;
        _context = context;
    }
    public async Task<IActionResult> Table()
        {
            var appointments = await _context.Appointments
            .Include(a => a.Client)
            .Include(a => a.AvailableDay)
                .ThenInclude (d => d.HealthcarePersonnel)
                .ToListAsync();
                _logger.LogInformation("Appointments list  accessed  at {Time}", DateTime.Now);
                return View(appointments);
        }
    
    [HttpGet]
    public async Task<IActionResult> Create(){
        ViewBag.Clients = await _context.Users
        .Where(u => u.Role == "Client")
        .ToListAsync();
        
        ViewBag.AvailableDays = await _context.AvailableDays
            .Include(d => d.HealthcarePersonnel)
            .ToListAsync();

            return View();
    }
    public async Task<IActionResult> Create(Appointment appointment){
        if(ModelState.IsValid){
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            _logger.LogInformation("New  appointment created at {Time} ", DateTime.Now);
            return RedirectToAction(nameof(Table));
        }
        ViewBag.Clients = await _context.Users
            .Where (u => u.Role == "Client")
            .ToListAsync();

        ViewBag.AvailableDays = await _context.AvailableDays
            .Include (d=> d.HealthcarePersonnel)
            .ToListAsync();
            return View(appointment);
    }
    [HttpGet]
    public async  Task<IActionResult> Update (int id){
        var appointment  = await _context.Appointments.FindAsync(id);
        if (appointment==null){
            _logger.LogWarning ("Appointment with id", id);
        }
        ViewBag.AvailableDays = await _context.AvailableDays.ToListAsync();
        ViewBag.Clients = await _context.Users
        .Where(u=> u.Role ==  "Client")
        .ToListAsync();
        return View(appointment);
    }
    [HttpPost]
    public async Task<IActionResult> Update(Appointment appointment){
        if (ModelState.IsValid){
            _context.Appointments.Update (appointment);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Table));
        }
        ViewBag.AvailableDays = await _context.AvailableDays.ToListAsync();
        ViewBag.Clients = await _context.Users.Where(u=> u.Role == "Client").ToListAsync();
        return View(appointment);
    }
    
    
    [HttpGet]
    public async Task<IActionResult> Delete(int id){
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();
        return View();
    }


    [HttpPost]
    public async Task<IActionResult> DeleConfirmed(int id){
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment ==null) return NotFound();

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Table));
    }

}