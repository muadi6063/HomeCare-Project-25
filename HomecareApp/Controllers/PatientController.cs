using Microsoft.AspNetCore.Mvc;

public class PatientController : Controller
{
    private readonly ILogger<PatientController> _logger;
    public PatientController(ILogger <PatientController> logger){
        _logger = logger;
    }
    public IActionResult Index()
    {
        _logger.LogInformation("Patient page accessed at {Time}", DateTime.Now);
        return View();
    }
}