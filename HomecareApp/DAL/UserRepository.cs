using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using HomeCareApp.Models;

namespace HomeCareApp.DAL;

public class UserRepository : IUserRepository
{
    private readonly HomeCareDbContext _db;
    private readonly ILogger<UserRepository> _logger;
    private readonly UserManager<User> _userManager;

    public UserRepository(
        HomeCareDbContext db,
        ILogger<UserRepository> logger,
        UserManager<User> userManager)
    {
        _db = db;
        _logger = logger;
        _userManager = userManager;
    }

    public async Task<IEnumerable<User>> GetAll()
    {
        try
        {
            return await _db.Users.ToListAsync();  // Users, not Users!
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] GetAll() failed, error message: {e}", e.Message);
            return new List<User>();
        }
    }

    public async Task<User?> GetUserById(string id)  // string, not int!
    {
        try
        {
            return await _db.Users.FindAsync(id);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] GetUserById(string) failed for id {UserId}, error message: {e}", id, e.Message);
            return null;
        }
    }

    public async Task<User?> GetUserByEmail(string email)
    {
        try
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] GetUserByEmail() failed, error message: {e}", e.Message);
            return null;
        }
    }

    public async Task<IEnumerable<User>> GetUsersByRole(string role)
    {
        try
        {
            // Use UserManager for roles, not u.Role!
            var usersInRole = await _userManager.GetUsersInRoleAsync(role);
            return usersInRole;
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] GetUsersByRole() failed, error message: {e}", e.Message);
            return new List<User>();
        }
    }

    public async Task<bool> Create(User user)
    {
        try
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] Create() failed for user {@user}, error message: {e}", user, e.Message);
            return false;
        }
    }

    public async Task<bool> Update(User user)
    {
        try
        {
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] Update() failed for user {@user}, error message: {e}", user, e.Message);
            return false;
        }
    }

    public async Task<bool> Delete(string id)
    {
        try
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogError("[UserRepository] User not found for the UserId {UserId}", id);
                return false;
            }

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError("[UserRepository] Delete() failed for UserId {UserId}, error message: {e}", id, e.Message);
            return false;
        }
    }
}