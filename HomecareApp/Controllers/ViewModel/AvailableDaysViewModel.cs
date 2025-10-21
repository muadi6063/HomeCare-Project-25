using HomecareApp.Models;

namespace HomecareApp.ViewModels;

public class AvailableDaysViewModel
{
    public IEnumerable<IGrouping<User, AvailableDay>> AvailableDays { get; set; }
    public string? CurrentViewName { get; set; }

    public AvailableDaysViewModel(IEnumerable<IGrouping<User, AvailableDay>> availableDays, string? currentViewName)
    {
        AvailableDays = availableDays;
        CurrentViewName = currentViewName;
    }
}
