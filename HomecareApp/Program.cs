using Serilog;
using Microsoft.EntityFrameworkCore;
using HomecareApp.Models;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<HomeCareDbContext>(options =>
{
    options.UseSqlite(
        builder.Configuration["ConnectionStrings:HomeCareDbContextConnection"]);
});

var loggerConfiguration = new LoggerConfiguration()
.MinimumLevel.Information()
.WriteTo.Console()
.WriteTo.File($"Logs/app_{DateTime.Now:yyyyMMdd_HHmmss}.log");

var logger = loggerConfiguration.CreateLogger();
builder.Logging.AddSerilog(logger);

var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// This is temporary database seeding for testing
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HomeCareDbContext>();

    // Ensure database is created
    context.Database.EnsureCreated();

    // Seed users if none exist
    if (!context.Users.Any())
    {
        context.Users.AddRange(
            // Healthcare Personnel
            new User { Name = "Dr. Sarah Smith", Email = "sarah.smith@homecare.com", Role = "HealthcarePersonnel" },
            new User { Name = "Nurse Michael Johnson", Email = "michael.johnson@homecare.com", Role = "HealthcarePersonnel" },
            new User { Name = "Therapist Lisa Wong", Email = "lisa.wong@homecare.com", Role = "HealthcarePersonnel" },

            // Clients
            new User { Name = "John Anderson", Email = "john.anderson@gmail.com", Role = "Client" },
            new User { Name = "Mary Thompson", Email = "mary.thompson@gmail.com", Role = "Client" },

            // Admin
            new User { Name = "System Administrator", Email = "admin@homecare.com", Role = "Admin" }
        );

        context.SaveChanges();
    }
}

app.Run();
