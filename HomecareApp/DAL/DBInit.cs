using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using HomeCareApp.Models;

namespace HomeCareApp.DAL;

public static class DBInit
{
    // Seed the database with initial test data
    public static async void Seed(IApplicationBuilder app)
    {
        using var serviceScope = app.ApplicationServices.CreateScope();
        var context = serviceScope.ServiceProvider.GetRequiredService<HomeCareDbContext>();
        var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceScope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        // Create roles if they don't exist
        var roles = new[] { "Client", "HealthcarePersonnel", "Admin" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (!context.Users.Any()) {
            // Create sample users with different roles
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

// NEW CLIENTS
var erik = new User
{
    UserName = "erik@client.com",
    Email = "erik@client.com",
    Name = "Erik",
    EmailConfirmed = true
};
await userManager.CreateAsync(erik, "Password123!");
await userManager.AddToRoleAsync(erik, "Client");

var lisa = new User
{
    UserName = "lisa@client.com",
    Email = "lisa@client.com",
    Name = "Lisa",
    EmailConfirmed = true
};
await userManager.CreateAsync(lisa, "Password123!");
await userManager.AddToRoleAsync(lisa, "Client");

var per = new User
{
    UserName = "per@client.com",
    Email = "per@client.com",
    Name = "Per",
    EmailConfirmed = true
};
await userManager.CreateAsync(per, "Password123!");
await userManager.AddToRoleAsync(per, "Client");

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

// NEW HEALTHCARE PERSONNEL
var anna = new User
{
    UserName = "anna@healthcare.com",
    Email = "anna@healthcare.com",
    Name = "Anna",
    EmailConfirmed = true
};
await userManager.CreateAsync(anna, "Password123!");
await userManager.AddToRoleAsync(anna, "HealthcarePersonnel");

var tom = new User
{
    UserName = "tom@healthcare.com",
    Email = "tom@healthcare.com",
    Name = "Tom",
    EmailConfirmed = true
};
await userManager.CreateAsync(tom, "Password123!");
await userManager.AddToRoleAsync(tom, "HealthcarePersonnel");

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

// Create sample available days for healthcare personnel
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
        },
        // NEW AVAILABLE DAYS
        new AvailableDay 
        { 
            HealthcarePersonnelId = sarah.Id, 
            Date = DateTime.Today.AddDays(3),
            StartTime = new TimeSpan(10, 0, 0),
            EndTime = new TimeSpan(10, 45, 0)
        },
        new AvailableDay 
        { 
            HealthcarePersonnelId = anna.Id, 
            Date = DateTime.Today.AddDays(1),
            StartTime = new TimeSpan(13, 0, 0),
            EndTime = new TimeSpan(13, 45, 0)
        },
        new AvailableDay 
        { 
            HealthcarePersonnelId = anna.Id, 
            Date = DateTime.Today.AddDays(4),
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(9, 45, 0)
        },
        new AvailableDay 
        { 
            HealthcarePersonnelId = tom.Id, 
            Date = DateTime.Today.AddDays(2),
            StartTime = new TimeSpan(11, 0, 0),
            EndTime = new TimeSpan(11, 45, 0)
        },
        new AvailableDay 
        { 
            HealthcarePersonnelId = tom.Id, 
            Date = DateTime.Today.AddDays(5),
            StartTime = new TimeSpan(15, 0, 0),
            EndTime = new TimeSpan(15, 45, 0)
        },
        new AvailableDay 
        { 
            HealthcarePersonnelId = mike.Id, 
            Date = DateTime.Today.AddDays(3),
            StartTime = new TimeSpan(8, 0, 0),
            EndTime = new TimeSpan(8, 45, 0)
        }
    };

    context.AddRange(availableDays);
    await context.SaveChangesAsync();
}

// Create sample appointments for testing
if (!context.Appointments.Any())
{
    var firstAvailableDay = await context.AvailableDays.OrderBy(a => a.AvailableDayId).FirstAsync();
    var secondAvailableDay = await context.AvailableDays.OrderBy(a => a.AvailableDayId).Skip(1).FirstAsync();
    var thirdAvailableDay = await context.AvailableDays.OrderBy(a => a.AvailableDayId).Skip(2).FirstAsync();
    
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
        },
        // NEW APPOINTMENTS
        new Appointment
        {
            ClientId = mary.Id,
            AvailableDayId = secondAvailableDay.AvailableDayId,
            StartTime = new TimeSpan(14, 0, 0),
            EndTime = new TimeSpan(14, 45, 0),
            TaskDescription = "Shopping assistance and meal preparation",
            Address = "Pilestredet 46, Oslo"
        },
        new Appointment
        {
            ClientId = erik.Id,
            AvailableDayId = thirdAvailableDay.AvailableDayId,
            StartTime = new TimeSpan(10, 0, 0),
            EndTime = new TimeSpan(10, 45, 0),
            TaskDescription = "Physical therapy exercises",
            Address = "Majorstuen 15, Oslo"
        },
        new Appointment
        {
            ClientId = lisa.Id,
            AvailableDayId = firstAvailableDay.AvailableDayId,
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(9, 45, 0),
            TaskDescription = "Wound care and bandage change",
            Address = "Grünerløkka 8, Oslo"
        },
        new Appointment
        {
            ClientId = per.Id,
            AvailableDayId = secondAvailableDay.AvailableDayId,
            StartTime = new TimeSpan(14, 0, 0),
            EndTime = new TimeSpan(14, 45, 0),
            TaskDescription = "Diabetes monitoring and insulin administration",
            Address = "Frogner 34, Oslo"
        }
    };

    context.AddRange(appointments);
    await context.SaveChangesAsync();
}
        }
    }
}