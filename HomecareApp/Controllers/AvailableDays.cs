using Microsoft.AspNetCore.Mvc;

public class AvailableDays : Controller
{
    private readonly ILogger<AvailableDays> _logger;
    public AvailableDays(ILogger <AvailableDays> logger){
        _logger = logger;
    }
    public IActionResult Index()
    {
        _logger.LogInformation("Patient page accessed at {Time}", DateTime.Now);
        return View();
    }
}