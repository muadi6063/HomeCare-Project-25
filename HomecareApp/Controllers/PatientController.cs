using Microsoft.AspNetCore.Mvc;

public class PatientController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}