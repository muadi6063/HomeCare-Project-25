using HomeCareApp.Models;

namespace HomeCareApp.DAL;
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAll();
        Task<User?> GetUserById(int id);
        Task<IEnumerable<User>> GetUsersByRole(string role);
        Task Create(User user);
        Task Update(User user);
        Task<bool> Delete(int id);
    }