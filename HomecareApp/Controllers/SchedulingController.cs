// Fix this page later if we are going for a merged controller!!!!! This is not needed now





// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using HomecareApp.Models;

// namespace HomecareApp.Controllers
// {
//     public class SchedulingController : Controller
//     {
//         private readonly HomeCareDbContext _context;
//         private readonly ILogger<SchedulingController> _logger;

//         public SchedulingController(HomeCareDbContext context, ILogger<SchedulingController> logger)
//         {
//             _context = context;
//             _logger = logger;
//         }

//         // Simple merged view - just show both tables on one page
//         public async Task<IActionResult> Index()
//         {
//             // Get available days
//             ViewBag.AvailableDays = await _context.AvailableDays
//                 .Include(d => d.HealthcarePersonnel)
//                 .OrderBy(d => d.Date)
//                 .ToListAsync();

//             // Get appointments  
//             var appointments = await _context.Appointments
//                 .Include(a => a.AvailableDay)
//                     .ThenInclude(d => d.HealthcarePersonnel)
//                 .Include(a => a.Client)
//                 .OrderBy(a => a.AvailableDay.Date)
//                 .ToListAsync();

//             _logger.LogInformation("Scheduling page accessed at {Time}", DateTime.Now);

//             return View(appointments); // Pass appointments as the main model
//         }

//         // Simple create appointment - just redirect to existing controller
//         public IActionResult CreateAppointment()
//         {
//             return RedirectToAction("Create", "Appointment");
//         }

//         // Simple create available day - just redirect to existing controller  
//         public IActionResult CreateAvailableDay()
//         {
//             return RedirectToAction("Create", "AvailableDay");
//         }
//     }
// }