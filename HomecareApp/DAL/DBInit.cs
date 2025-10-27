using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

namespace HomecareApp.DAL;

public static class DBInit
{
    public static void Seed(IApplicationBuilder app)
    {
        using var serviceScope = app.ApplicationServices.CreateScope();
        HomeCareDbContext context = serviceScope.ServiceProvider.GetRequiredService<HomeCareDbContext>();
        
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        if (!context.Users.Any())
        {
            var users = new List<User>
            {
                new User { Name = "John Doe", Email = "john@client.com", Role = "Client" },
                new User { Name = "Mary Johnson", Email = "mary@client.com", Role = "Client" },
                new User { Name = "Dr. Sarah Smith", Email = "sarah@healthcare.com", Role = "HealthcarePersonnel" },
                new User { Name = "Nurse Mike Wilson", Email = "mike@healthcare.com", Role = "HealthcarePersonnel" },
                new User { Name = "Admin User", Email = "admin@homecare.com", Role = "Admin" }
            };

            context.AddRange(users);
            context.SaveChanges();
        }

        if (!context.AvailableDays.Any())
        {
            var availableDays = new List<AvailableDay>
            {
                new AvailableDay 
                { 
                    HealthcarePersonnelId = 3, 
                    Date = DateTime.Today.AddDays(1),
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(12, 0, 0)
                },
                new AvailableDay 
                { 
                    HealthcarePersonnelId = 4, 
                    Date = DateTime.Today.AddDays(2),
                    StartTime = new TimeSpan(14, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0)
                }
            };

            context.AddRange(availableDays);
            context.SaveChanges();
        }

        if (!context.Appointments.Any())
        {
            var appointments = new List<Appointment>
            {
                new Appointment 
                { 
                    ClientId = 1, // John Doe
                    AvailableDayId = 1,
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(12, 0, 0),
                    TaskDescription = "Medication reminder and blood pressure check"
                }
            };

            context.AddRange(appointments);
            context.SaveChanges();
        }
    }
}
