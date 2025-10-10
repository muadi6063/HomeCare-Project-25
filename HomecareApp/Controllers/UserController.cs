
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;
using HomecareApp.ViewModels;

namespace HomecareApp.Controllers;
public class UserController : Controller
{
    private readonly HomeCareDbContext _homeCareDbContext;

    public UserController(HomeCareDbContext context)
    {
        _homeCareDbContext = context;
    }

    public async Task<IActionResult> Table()
    {
        var users = await _homeCareDbContext.Users.ToListAsync();
        var viewModel = new UsersViewModel(users, "Table");
        return View(viewModel);
    }

    public async Task<IActionResult> Create()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(User user)
    {
        if (ModelState.IsValid)
        {
            _homeCareDbContext.Users.Add(user);
            await _homeCareDbContext.SaveChangesAsync();
            return RedirectToAction(nameof(Table));
        }
        return View(user);
    }

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        var user = await _homeCareDbContext.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return View(user);
    }

    [HttpPost]
    public async Task<IActionResult> Update(User user)
    {
        if (ModelState.IsValid)
        {
            _homeCareDbContext.Users.Update(user);
            await _homeCareDbContext.SaveChangesAsync();
            return RedirectToAction(nameof(Table));
        }
        return View(user);
    }

    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _homeCareDbContext.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return View(user);
    }

    [HttpPost]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var user = await _homeCareDbContext.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        _homeCareDbContext.Users.Remove(user);
        await _homeCareDbContext.SaveChangesAsync();
        return RedirectToAction(nameof(Table));
    }
}