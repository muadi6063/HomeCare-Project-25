using Microsoft.AspNetCore.Identity.EntityFrameworkCore;  
using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;

namespace HomeCareApp.DAL;

public class HomeCareDbContext : IdentityDbContext<User> 
{
    public HomeCareDbContext(DbContextOptions<HomeCareDbContext> options) : base(options)
    {
    }

    // Database sets representing tables
    public DbSet<AvailableDay> AvailableDays { get; set; }
    public DbSet<Appointment> Appointments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}