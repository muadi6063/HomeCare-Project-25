using Microsoft.AspNetCore.Mvc;

public class ShiftController : Controller
{
    private readonly ILogger<ShiftController> _logger;
    
    public ShiftController(ILogger<ShiftController> logger){
        _logger = logger;
    }
    public IActionResult Index()
    {
        _logger.LogInformation("Shift page accessed at {Time}", DateTime.Now);
        return View();
    }
}