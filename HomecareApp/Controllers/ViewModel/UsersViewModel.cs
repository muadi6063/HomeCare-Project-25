using HomecareApp.Models;

namespace HomecareApp.ViewModels;

public class UsersViewModel
{
    public IEnumerable<User> Users { get; set; }
    public string? CurrentViewName { get; set; }

    public UsersViewModel(IEnumerable<User> users, string? currentViewName)
    {
        Users = users;
        CurrentViewName = currentViewName;
    }
}
