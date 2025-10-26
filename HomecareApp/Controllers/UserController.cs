using Microsoft.AspNetCore.Mvc;
using HomecareApp.Models;
using HomecareApp.ViewModels;
using HomecareApp.DAL;

namespace HomecareApp.Controllers;
public class UserController : Controller
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IActionResult> Table()
    {
        var users = await _userRepository.GetAll();
        var viewModel = new UsersViewModel(users, "Table");
        return View(viewModel);
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(User user)
    {
        if (ModelState.IsValid)
        {
            await _userRepository.Create(user);
            return RedirectToAction(nameof(Table));
        }
        return View(user);
    }

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        var user = await _userRepository.GetUserById(id);
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
            await _userRepository.Update(user);
            return RedirectToAction(nameof(Table));
        }
        return View(user);
    }

    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _userRepository.GetUserById(id);
        if (user == null)
        {
            return NotFound();
        }
        return View(user);
    }

    [HttpPost]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var result = await _userRepository.Delete(id);
        if (!result)
        {
            return NotFound();
        }
        return RedirectToAction(nameof(Table));
    }
}