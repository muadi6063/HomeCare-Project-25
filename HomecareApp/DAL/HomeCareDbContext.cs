using HomecareApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HomecareApp.Models;

public class HomeCareDbContext : DbContext
{
    public HomeCareDbContext(DbContextOptions<HomeCareDbContext> options) : base(options)
    {
        // Database.EnsureCreated();
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<AvailableDay> AvailableDays { get; set; }
    // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    // {
    //     optionsBuilder.UseLazyLoadingProxies();
    // }

}