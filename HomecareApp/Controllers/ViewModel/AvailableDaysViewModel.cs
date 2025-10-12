using HomecareApp.Models;

namespace HomecareApp.ViewModels;

public class AvailableDaysViewModel
{
    public IEnumerable<AvailableDay> AvailableDays { get; set; }
    public string? CurrentViewName { get; set; }

    public AvailableDaysViewModel(IEnumerable<AvailableDay> availableDays, string? currentViewName)
    {
        AvailableDays = availableDays;
        CurrentViewName = currentViewName;
    }
}
