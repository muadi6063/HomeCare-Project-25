using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

namespace HomecareApp.DAL;

public class UserRepository : IUserRepository
{
    private readonly HomeCareDbContext _db;

    public UserRepository(HomeCareDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<User>> GetAll()
    {
        return await _db.Users.ToListAsync();
    }

    public async Task<User?> GetUserById(int id)
    {
        return await _db.Users.FindAsync(id);
    }

    public async Task<IEnumerable<User>> GetUsersByRole(string role)
    {
        return await _db.Users
            .Where(u => u.Role == role)
            .ToListAsync();
    }

    public async Task Create(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task Update(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return false;
        
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }
}