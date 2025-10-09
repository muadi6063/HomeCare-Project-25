using Microsoft.AspNetCore.Mvc;

public class AppointmentController : Controller
{
    private readonly ILogger<AppointmentController> _logger;
    
    public AppointmentController(ILogger<AppointmentController> logger){
        _logger = logger;
    }
    public IActionResult Index()
    {
        _logger.LogInformation("Shift page accessed at {Time}", DateTime.Now);
        return View();
    }
}