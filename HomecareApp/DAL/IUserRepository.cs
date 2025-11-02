using HomeCareApp.Models;

namespace HomeCareApp.DAL;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAll();
    Task<User?> GetUserById(int id);
    Task<IEnumerable<User>> GetUsersByRole(string role);
    Task<bool> Create(User user);
    Task<bool> Update(User user);
    Task<bool> Delete(int id);
}