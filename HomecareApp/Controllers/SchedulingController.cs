using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;
using HomecareApp.ViewModels;

namespace HomecareApp.Controllers
{
    public class SchedulingController : Controller
    {
        private readonly HomeCareDbContext _context;
        private readonly ILogger<SchedulingController> _logger;

        public SchedulingController(HomeCareDbContext context, ILogger<SchedulingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            // Hent alle available days med helsepersonell og tilhørende avtaler
            var availableDays = await _context.AvailableDays
                .Include(d => d.HealthcarePersonnel)
                .Include(d => d.Appointments)
                    .ThenInclude(a => a.Client)
                .ToListAsync();

            // Hent alle avtaler med info om dag, helsepersonell og klient
            var appointments = await _context.Appointments
                .Include(a => a.AvailableDay)
                    .ThenInclude(d => d.HealthcarePersonnel)
                .Include(a => a.Client)
                .ToListAsync();

            // Sett sammen dataene i ViewModel
            var viewModel = new SchedulingViewModel
            {
                AvailableDays = availableDays,
                Appointments = appointments
            };

            _logger.LogInformation("Scheduling dashboard accessed at {Time}", DateTime.Now);

            return View(viewModel);
        }
    }
}
