using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using HomeCareApp.Models;

namespace HomeCareApp.DAL;

public static class DBInit
{
    public static async void Seed(IApplicationBuilder app)
    {
        using var serviceScope = app.ApplicationServices.CreateScope();
        var context = serviceScope.ServiceProvider.GetRequiredService<HomeCareDbContext>();
        var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceScope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        var roles = new[] { "Client", "HealthcarePersonnel", "Admin" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (!context.Users.Any())
        {
            var john = new User 
            { 
                UserName = "john@client.com",
                Email = "john@client.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(john, "Password123!");
            await userManager.AddToRoleAsync(john, "Client");

            var mary = new User 
            { 
                UserName = "mary@client.com",
                Email = "mary@client.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(mary, "Password123!");
            await userManager.AddToRoleAsync(mary, "Client");

            var sarah = new User 
            { 
                UserName = "sarah@healthcare.com",
                Email = "sarah@healthcare.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(sarah, "Password123!");
            await userManager.AddToRoleAsync(sarah, "HealthcarePersonnel");

            var mike = new User 
            { 
                UserName = "mike@healthcare.com",
                Email = "mike@healthcare.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(mike, "Password123!");
            await userManager.AddToRoleAsync(mike, "HealthcarePersonnel");

            var admin = new User 
            { 
                UserName = "admin@homecare.com",
                Email = "admin@homecare.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(admin, "Admin123!");
            await userManager.AddToRoleAsync(admin, "Admin");

            await context.SaveChangesAsync();

            if (!context.AvailableDays.Any())
            {
                var availableDays = new List<AvailableDay>
                {
                    new AvailableDay 
                    { 
                        HealthcarePersonnelId = sarah.Id, // String ID
                        Date = DateTime.Today.AddDays(1),
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(12, 0, 0)
                    },
                    new AvailableDay 
                    { 
                        HealthcarePersonnelId = mike.Id, // String ID
                        Date = DateTime.Today.AddDays(2),
                        StartTime = new TimeSpan(14, 0, 0),
                        EndTime = new TimeSpan(17, 0, 0)
                    }
                };

                context.AddRange(availableDays);
                await context.SaveChangesAsync();
            }

            if (!context.Appointments.Any())
            {
                var firstAvailableDay = await context.AvailableDays.OrderBy(a => a.AvailableDayId).FirstAsync();
                
                var appointments = new List<Appointment>
                {
                    new Appointment 
                    { 
                        ClientId = john.Id, // String ID
                        AvailableDayId = firstAvailableDay.AvailableDayId,
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(12, 0, 0),
                        TaskDescription = "Medication reminder and blood pressure check"
                    }
                };

                context.AddRange(appointments);
                await context.SaveChangesAsync();
            }
        }
    }
}