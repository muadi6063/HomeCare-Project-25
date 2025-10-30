using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.ViewModels;
using HomeCareApp.DAL;

namespace HomeCareApp.Controllers;

public class UserController : Controller
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserRepository userRepository, ILogger<UserController> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<IActionResult> Table()
    {
        try
        {
            var users = await _userRepository.GetAll();
            if (users == null)
            {
                _logger.LogError("[UserController] User list not found while executing _userRepository.GetAll()");
                return NotFound("User list not found");
            }
            var viewModel = new UsersViewModel(users, "Table");
            return View(viewModel);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserController] Error loading users for table, error message: {e}", e.Message);
            var emptyUsers = new List<User>();
            var emptyViewModel = new UsersViewModel(emptyUsers, "Table");
            return View(emptyViewModel);
        }
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(User user)
    {
        try
        {
            if (ModelState.IsValid)
            {
                await _userRepository.Create(user);
                return RedirectToAction(nameof(Table));
            }
            
            _logger.LogWarning("[UserController] User creation failed {@user}", user);
            return View(user);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserController] Error creating user, error message: {e}", e.Message);
            return View(user);
        }
    }

    [HttpGet]
    public async Task<IActionResult> Update(int id)
    {
        try
        {
            var user = await _userRepository.GetUserById(id);
            if (user == null)
            {
                _logger.LogError("[UserController] User not found for the UserId {UserId:0000}", id);
                return NotFound("User not found for the UserId");
            }
            return View(user);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserController] Error loading user for update, UserId {UserId:0000}, error message: {e}", id, e.Message);
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<IActionResult> Update(User user)
    {
        try
        {
            if (ModelState.IsValid)
            {
                await _userRepository.Update(user);
                return RedirectToAction(nameof(Table));
            }
            
            _logger.LogWarning("[UserController] User update failed {@user}", user);
            return View(user);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserController] Error updating user, error message: {e}", e.Message);
            return View(user);
        }
    }

    [HttpGet]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var user = await _userRepository.GetUserById(id);
            if (user == null)
            {
                _logger.LogError("[UserController] User not found for the UserId {UserId:0000}", id);
                return NotFound();
            }
            return View(user);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserController] Error loading user for deletion, UserId {UserId:0000}, error message: {e}", id, e.Message);
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        try
        {
            var result = await _userRepository.Delete(id);
            if (!result)
            {
                _logger.LogError("[UserController] User deletion failed for UserId {UserId:0000}", id);
                return NotFound();
            }
            return RedirectToAction(nameof(Table));
        }
        catch (Exception e)
        {
            _logger.LogError("[UserController] Error deleting user, UserId {UserId:0000}, error message: {e}", id, e.Message);
            return RedirectToAction(nameof(Table));
        }
    }
}