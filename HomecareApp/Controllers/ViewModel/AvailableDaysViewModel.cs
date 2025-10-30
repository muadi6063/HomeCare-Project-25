using HomeCareApp.Models;

namespace HomeCareApp.ViewModels;

public class AvailableDaysViewModel
{

    // Each group contains all available time slots for one healthcare worker using igrouping
    public IEnumerable<IGrouping<User, AvailableDay>> AvailableDays { get; set; }
    public string? CurrentViewName { get; set; }

    public AvailableDaysViewModel(IEnumerable<IGrouping<User, AvailableDay>> availableDays, string? currentViewName)
    {
        AvailableDays = availableDays;
        CurrentViewName = currentViewName;
    }
}
