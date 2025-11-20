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
                Name = "John",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(john, "Password123!");
            await userManager.AddToRoleAsync(john, "Client");

            var mary = new User
            {
                UserName = "mary@client.com",
                Email = "mary@client.com",
                Name = "Mary",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(mary, "Password123!");
            await userManager.AddToRoleAsync(mary, "Client");

            var sarah = new User
            {
                UserName = "sarah@healthcare.com",
                Email = "sarah@healthcare.com",
                Name = "Sarah",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(sarah, "Password123!");
            await userManager.AddToRoleAsync(sarah, "HealthcarePersonnel");

            var mike = new User
            {
                UserName = "mike@healthcare.com",
                Email = "mike@healthcare.com",
                Name = "Mike",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(mike, "Password123!");
            await userManager.AddToRoleAsync(mike, "HealthcarePersonnel");

            var admin = new User
            {
                UserName = "admin@homecare.com",
                Email = "admin@homecare.com",
                Name = "Admin",
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
                        HealthcarePersonnelId = sarah.Id, 
                        Date = DateTime.Today.AddDays(1),
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(9, 45, 0)
                    },
                    new AvailableDay 
                    { 
                        HealthcarePersonnelId = mike.Id, 
                        Date = DateTime.Today.AddDays(2),
                        StartTime = new TimeSpan(14, 0, 0),
                        EndTime = new TimeSpan(14, 45, 0)
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
                        ClientId = john.Id,
                        AvailableDayId = firstAvailableDay.AvailableDayId,
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(9, 45, 0),
                        TaskDescription = "Medication reminder and blood pressure check",
                        Address = "Oslomet 23, Oslo"
                    }
                };

                context.AddRange(appointments);
                await context.SaveChangesAsync();
            }
        }
    }
}